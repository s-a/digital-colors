#!/usr/bin/env node

const spawn = require('child_process').spawn
const highlight = require('cli-highlight').highlight
const colors = require('chalk')
const argv = require('minimist')(process.argv.slice(2), {stopEarly: true})
const { Parser } = require('node-sql-parser'); // Added
const cmd = argv._.shift()

// Signal handlers
process.on('SIGINT', process.exit)
process.on('SIGQUIT', process.exit)
process.on('SIGTERM', process.exit)

function highlightSql(sqlString) {
  const parser = new Parser();
  try {
    // Heuristic to quickly check if it's worth parsing
    const commonSqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|EXEC|CREATE|ALTER|DROP|FROM|WHERE|VALUES|SET|DECLARE|TABLE|VIEW|PROCEDURE|FUNCTION|BEGIN|END|COMMIT|ROLLBACK)\b/i;
    const seemsLikeSql = commonSqlKeywords.test(sqlString);
    const hasExec = sqlString.toUpperCase().includes('EXEC');

    if (!seemsLikeSql && !hasExec) { // If no common keywords and no EXEC, probably not SQL
        if (!sqlString.match(/@[a-zA-Z0-9_]+\s*=\s*'/g)) { // allow things like @variable = '...'
            return sqlString;
        }
    }
    
    // Avoid parsing very long strings that are unlikely to be single SQL statements
    // unless it's an EXEC statement, which can have long parameters.
    if (sqlString.length > 2500 && !hasExec) {
        return sqlString;
    }
    // Avoid parsing if it looks like a file path or common data formats not SQL
    if ((sqlString.includes('/') || sqlString.includes('\\')) && !hasExec && !seemsLikeSql) {
        if (!sqlString.match(/['"`]\s*SELECT\s/i)) { // allow SELECT if it's embedded
             return sqlString;
        }
    }


    const ast = parser.astify(sqlString, { database: 'Tsql' });
    let highlightedString = sqlString;

    // Define SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'EXEC', 'CREATE', 'ALTER', 'DROP',
      'INTO', 'VALUES', 'SET', 'ON', 'AS', 'WITH', 'DECLARE', 'CURSOR', 'OPEN', 'FETCH', 'CLOSE',
      'DEALLOCATE', 'TABLE', 'VIEW', 'INDEX', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE',
      'BEGIN', 'END', 'IF', 'ELSE', 'WHILE', 'BREAK', 'CONTINUE', 'RETURN', 'GROUP', 'BY', 'ORDER',
      'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'UNION', 'ALL', 'DISTINCT', 'TOP',
      'CASE', 'WHEN', 'THEN', 'NULL', 'IS', 'NOT', 'AND', 'OR', 'EXISTS', 'BETWEEN', 'LIKE', 'IN',
      'GRANT', 'REVOKE', 'DENY', 'TRUNCATE', 'COMMIT', 'ROLLBACK', 'SAVE', 'TRANSACTION',
      'PRINT', 'RAISERROR', 'GOTO'
    ];

    const statements = Array.isArray(ast) ? ast : [ast];

    statements.forEach(statement => {
      if (statement && statement.type === 'exec') {
        let procName;
        // Path for EXEC proc_name ... or EXEC schema.proc_name ...
        if (statement.expression && statement.expression.type === 'function' && statement.expression.name) {
            procName = parser.sqlify(statement.expression.name, {database: 'Tsql'});
        } 
        // Path for simple EXEC proc_name (without function wrapper in AST)
        else if (statement.proc && statement.proc.value) {
             procName = statement.proc.value; // This is often an array for schema.proc
             if(Array.isArray(procName)) procName = procName.map(p => p.value).join('.');
        }


        if (procName) {
          // Proc name might contain special characters for regex, so escape it.
          const escapedProcName = procName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          // Use a regex that ensures we are matching the specific proc name, considering word boundaries or context.
          // This is tricky because proc names can be part of other text.
          // A simple approach: replace only if surrounded by non-word characters or start/end of string.
          const procNameRegex = new RegExp(`(?<=[^\\w.]|^)${escapedProcName}(?=[^\\w.]|$)`, 'gi');
          highlightedString = highlightedString.replace(procNameRegex, colors.green.bold(procName));
        }

        // Highlight Parameters for EXEC
        const args = (statement.expression && statement.expression.args) ? statement.expression.args : (statement.args || []);
        if (args && args.length > 0) {
          args.forEach(arg => {
            // The value node might be nested inside 'value' property of arg
            const valueNode = arg.value;
            if (valueNode && (valueNode.type === 'string' || valueNode.type === 'number' || valueNode.type === 'boolean' || valueNode.type === 'null' || valueNode.type === 'param')) {
              let paramValueStr;
              let rawValue = valueNode.value;

              if (valueNode.type === 'string') {
                const isXml = rawValue.trim().startsWith('<') && rawValue.trim().endsWith('>');
                const isJson = (rawValue.trim().startsWith('{') && rawValue.trim().endsWith('}')) ||
                               (rawValue.trim().startsWith('[') && rawValue.trim().endsWith(']'));
                if (isXml || isJson) {
                  return; // Skip XML/JSON for SQL parameter highlighting
                }
                 paramValueStr = `'${rawValue.replace(/'/g, "''")}'`; // Reconstruct SQL string literal form
                 if (sqlString.includes(`N${paramValueStr}`)) { // Check if original was N''
                    paramValueStr = `N${paramValueStr}`;
                 }

              } else if (valueNode.type === 'number') {
                paramValueStr = rawValue.toString();
              } else if (valueNode.type === 'boolean') {
                paramValueStr = rawValue ? 'TRUE' : 'FALSE';
              } else if (valueNode.type === 'null') {
                paramValueStr = 'NULL';
              } else if (valueNode.type === 'param') { // For @param_name
                paramValueStr = valueNode.value; // e.g. @MyVariable
                // We color the variable name itself if it's a parameter
                 highlightedString = highlightedString.replace(new RegExp(`\\b${paramValueStr}\\b`, 'g'), colors.cyan(paramValueStr));
                return; // Already handled, or don't color its "value" if it's an assignment source
              } else {
                return; // Skip other types for now
              }
              
              // Escape for regex and try to replace the specific parameter string
              const escapedParamStr = paramValueStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              // More careful regex: ensure it's not part of a larger word or already colored.
              // This looks for the param string not preceded by an alphanumeric or part of existing color code.
              const paramRegex = new RegExp(`(?<![\\w\\x1b\\[\\d{1,2}m])${escapedParamStr}(?![\\w\\x1b\\[\\d{1,2}m])`, 'g');
              highlightedString = highlightedString.replace(paramRegex, colors.magenta(paramValueStr));
            }
          });
        }
      }
    });
    
    // Highlight Keywords (after specific items like proc names and params)
    keywords.forEach(keyword => {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedString = highlightedString.replace(keywordRegex, (match) => {
        // Check if the match is already part of a colored segment (e.g. proc name, param)
        // This is a simplified check. A more robust way is to check actual characters around the match.
        // Find the position of the match
        let matchPos = -1;
        let tempStr = highlightedString;
        // This loop is to correctly find the position in case of multiple occurrences
        while( (matchPos = tempStr.indexOf(match, matchPos + 1)) != -1) {
            const substringBefore = highlightedString.substring(0, matchPos);
            const openColorCodes = (substringBefore.match(/\x1b\[\d{1,2}m/g) || []).length;
            const closeColorCodes = (substringBefore.match(/\x1b\[\d{1,2}m\x1b\[0m/g) || []).length; // simplified close
            const chalkResets = (substringBefore.match(/\x1b\[39m|\x1b\[22m|\x1b\[24m|\x1b\[27m|\x1b\[28m|\x1b\[29m/g) || []).length; // chalk specific resets

            // If inside an unclosed color sequence (very rough check)
            if (openColorCodes > closeColorCodes + chalkResets) {
                // check if the specific segment is colored differently than blue
                const segmentRegex = new RegExp(`\x1b\\[\\d{1,2}m${match}\x1b\\[\\d{1,2}m`, 'gi');
                if(!segmentRegex.test(highlightedString.substring(matchPos-10, matchPos+match.length+10))) {
                    // continue search
                } else {
                     return match; // It's already colored by something else, leave it.
                }
            } else {
                 break; // Found a non-colored one
            }
        }
        return colors.blue.bold(match.toUpperCase());
      });
    });
    
    // Highlight general string literals (that are not parameters already highlighted magenta)
    // This regex finds 'string' or N'string'
    highlightedString = highlightedString.replace(/(N)?'([^']*(?:''[^']*)*)'/g, (match, nPrefix, strContent) => {
        // Check if already colored magenta (parameter) or green (proc name that happens to be a string)
        // This is a very basic check by looking for ANSI codes immediately around the match in the current highlightedString
        // A more robust check would involve finding this match's position and checking its existing color.
        
        // If we search for the exact match in highlightedString and it's already wrapped in color, skip.
        // This is still imperfect.
        if (highlightedString.includes(colors.magenta(match)) || highlightedString.includes(colors.green.bold(match))) {
            return match;
        }
        // Avoid coloring XML/JSON content if it was not an EXEC parameter but just a string in query
        const isXml = strContent.trim().startsWith('<') && strContent.trim().endsWith('>');
        const isJson = (strContent.trim().startsWith('{') && strContent.trim().endsWith('}')) ||
                       (strContent.trim().startsWith('[') && strContent.trim().endsWith(']'));
        if (isXml || isJson) {
             return match; // Let other highlighters handle it
        }

        return colors.yellow(match);
    });

    // Highlight comments --
    highlightedString = highlightedString.replace(/--.*/g, colors.gray);
    // Highlight comments /* ... */
    highlightedString = highlightedString.replace(/\/\*[\s\S]*?\*\//g, colors.gray);


    return highlightedString;
  } catch (error) {
    // console.error("SQL Parsing Error:", error.message, "for SQL:", sqlString.substring(0,100));
    return sqlString; // If parsing fails, return original string
  }
}


function highlightAndPrint(dataString) {
	let chunk = dataString;

    // Attempt SQL highlighting first
	chunk = highlightSql(chunk);

	// URL highlighting (priority)
	// Base regex: (\/api\/[a-zA-Z0-9\/-_]+(?:\?(?:[^=\s]+=[^&\s]*&?)*)?)
	// Breaking it down:
	// 1. Path part: (\/api\/[a-zA-Z0-9\/-_]+)
	// 2. Query string part (optional): (?:\?((?:[^=&\s]+=[^&?\s]*(?:&|$))*))?
	const urlRegex = /(\/api\/[a-zA-Z0-9\/-_]+)(?:\?((?:[^=&\s]+=[^&?\s]*(?:&|$))*))?/g;
    chunk = chunk.replace(urlRegex, (fullMatch, pathPart, queryStringPart) => {
        // Avoid re-highlighting if SQL highlighter already did something that looks like a URL part
        if (fullMatch.includes('\x1b[')) return fullMatch; // Check for existing ANSI escape codes

        let highlightedUrl = colors.cyan(pathPart);
        if (queryStringPart !== undefined) {
            highlightedUrl += colors.cyan('?');
            if (queryStringPart) { // Only process if there are actual params
                const queryParamRegex = /([^=&\s]+)=([^&?\s]*)/g;
                const params = [];
                let match;
                while ((match = queryParamRegex.exec(queryStringPart)) !== null) {
                    const key = match[1] ? colors.yellow(match[1]) : '';
                    const value = match[2] ? colors.green(match[2]) : '';
                    params.push(key + colors.cyan('=') + value);
                }
                highlightedUrl += params.join(colors.cyan('&'));
            }
        }
        return highlightedUrl;
    });


	const xmlOrJsonLike = /(<[^>]+>|(\{.*\}|\[.*\]))/g;
    chunk = chunk.replace(xmlOrJsonLike, (match) => {
        if (match.includes('\x1b[')) return match; // Already colored by SQL highlighter or other

        // Basic check for XML-like
        if (match.startsWith('<') && match.endsWith('>')) {
            return colors.cyan(match); // XML cyan
        }
        // Basic check for JSON-like
        if ((match.startsWith('{') && match.endsWith('}')) || (match.startsWith('[') && match.endsWith(']'))) {
             // Avoid coloring huge, potentially non-JSON blocks if brackets mismatch heavily
            if (match.length > 2000 && ((match.match(/\{/g) || []).length !== (match.match(/\}/g) || []).length || (match.match(/\[/g) || []).length !== (match.match(/\]/g) || []).length)) {
                return match;
            }
            return colors.blue(match); // JSON blue
        }
        return match;
    });

	const dateTime = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:,\d{3})?(?:[+-]\d{2}:\d{2})?Z?)/ig; // Improved regex
	chunk = chunk.replace(dateTime, function (match) {
		if (match.includes('\x1b[')) return match;
		return colors.yellow(match);
	});

    const replaceIfNotColored = (text, regex, colorFunc) => {
        // This function tries to replace only if the segment is not already colored.
        // It's a heuristic and might not be perfect.
        let result = "";
        let lastIndex = 0;
        text.replace(regex, (match, ...args) => {
            const offset = args[args.length - 2]; //Offset of the match
            result += text.substring(lastIndex, offset); //Append text before match

            // Check if the match is already within a color escape sequence
            const preMatch = text.substring(Math.max(0, offset - 5), offset);
            const postMatch = text.substring(offset + match.length, Math.min(text.length, offset + match.length + 5));

            if (!preMatch.match(/\x1b\[\d{1,2}m$/) && !postMatch.match(/^\x1b\[\d{1,2}m/)) {
                 // If not immediately surrounded by color codes, check if the match itself contains them
                 if (!match.includes('\x1b[')) {
                    result += colorFunc(match);
                 } else {
                    result += match; // Already colored
                 }
            } else {
                result += match; // Part of a larger colored sequence
            }
            lastIndex = offset + match.length;
        });
        result += text.substring(lastIndex);
        return result;
    };

	chunk = replaceIfNotColored(chunk, / INFO /g, (m) => colors.green(m.trim()));
	chunk = replaceIfNotColored(chunk, / DEBUG /g, (m) => colors.gray(m.trim()));
	chunk = replaceIfNotColored(chunk, / ERROR /g, (m) => colors.red(m.trim()));
	chunk = replaceIfNotColored(chunk, / WARN | WARNING /g, (m) => colors.yellow(m.trim()));
	chunk = replaceIfNotColored(chunk, / FATAL /g, (m) => colors.redBright(m.trim()));


	// HTTP method highlighting
	const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
	const httpMethodRegex = new RegExp(`\\s(${httpMethods.join('|')})\\s`, 'g');
	chunk = chunk.replace(httpMethodRegex, function (fullMatch, methodName) {
    // Check if the method name or the surrounding spaces are already colored
    if (fullMatch.includes('\x1b[')) return fullMatch;
		return ' ' + colors.underline.bold(methodName) + ' ';
	});

	// eslint-disable-next-line no-console
	console.log(chunk.endsWith('\n') ? chunk.slice(0, -1) : chunk); // Avoid double newline if chunk has one
}

if (cmd) {
  // Execute command and highlight its output
  const tail = spawn(cmd, argv._);

  tail.stdout.on('data', function (data) {
    const lines = data.toString().split('\n');
    lines.forEach((line, index) => {
        if (index === lines.length -1 && line === '') return; // Skip empty line from trailing newline
        highlightAndPrint(line + (lines.length > 1 && index < lines.length -1 ? '\n' : ''));
    });
  });

  tail.stderr.on('data', (data) => {
    process.stderr.write(data); // stderr is not highlighted
  });

  tail.on('close', (code) => {
    process.exit(code);
  });

} else {
  // Process piped stdin
  process.stdin.setEncoding('utf8');
  let buffer = '';
  process.stdin.on('data', (dataChunk) => {
    buffer += dataChunk;
    let eolIndex;
    // Process line by line
    while ((eolIndex = buffer.indexOf('\n')) >= 0) {
      const line = buffer.substring(0, eolIndex + 1); // Keep newline for print processing
      highlightAndPrint(line);
      buffer = buffer.substring(eolIndex + 1);
    }
  });

  process.stdin.on('end', () => {
    if (buffer.length > 0) { // Process any remaining part of the buffer
      highlightAndPrint(buffer);
    }
    process.exit(0);
  });
}
// npm i minimist node-sql-parser chalk cli-highlight
module.exports = { highlightAndPrint, highlightSql };