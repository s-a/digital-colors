const { highlightSql } = require('../lib/index.js');
const chalk = require('chalk'); // Though not used for assertions, good for reference

const testCases = [
  {
    name: "Simple SELECT",
    input: "SELECT column1, column2 FROM table_name WHERE condition = 'value';"
  },
  {
    name: "INSERT statement",
    input: "INSERT INTO table_name (column1, column2) VALUES ('value1', 123);"
  },
  {
    name: "UPDATE statement",
    input: "UPDATE table_name SET column1 = 'new_value' WHERE id = 1;"
  },
  {
    name: "DELETE statement",
    input: "DELETE FROM table_name WHERE id = 1;"
  },
  {
    name: "EXEC statement",
    input: "EXEC sp_myProcedure @param1 = 'value1', @param2 = 123;"
  },
  {
    name: "EXEC with schema",
    input: "EXEC dbo.sp_anotherProc @data = '<root><item>1</item></root>';"
  },
  {
    name: "EXEC with XML parameter",
    input: "EXEC sp_xmlDemo @xmlData = '<user><id>1</id><name>Test</name></user>';"
  },
  {
    name: "EXEC with JSON parameter",
    input: "EXEC sp_jsonDemo @jsonData = '{\"key\": \"value\", \"nested\": {\"id\": 1}}';"
  },
  {
    name: "EXEC with mixed parameters",
    input: "EXEC sp_mixed @name = 'Test', @config = '{\"valid\": true}', @value = 100;"
  },
  {
    name: "SQL with single line comment",
    input: "SELECT * FROM users; -- This is a comment"
  },
  {
    name: "SQL with block comment",
    input: "SELECT name /* This is a block comment */ FROM products;"
  },
  {
    name: "Non-SQL string",
    input: "This is just a regular log line that might mention exec or select but is not SQL."
  },
  {
    name: "MS SQL specific EXECUTE",
    input: "EXECUTE master.dbo.sp_who;"
  },
  {
    name: "String literal",
    input: "SELECT 'This is a string literal' FROM DUAL;"
  },
  {
    name: "Keyword case-insensitivity",
    input: "select Name from Customers where City = 'london';"
  },
  {
    name: "EXEC with keyword-like proc name",
    input: "EXEC SelectUserDetails @UserID = 1;"
  },
  {
    name: "Complex SELECT with JOINs and functions",
    input: "SELECT DISTINCT u.UserName, COUNT(o.OrderID) AS NumOrders, GETDATE() FROM Users u JOIN Orders o ON u.UserID = o.UserID WHERE u.IsActive = 1 GROUP BY u.UserName HAVING COUNT(o.OrderID) > 0 ORDER BY NumOrders DESC;"
  },
  {
    name: "Declare variable and set",
    input: "DECLARE @MyVariable VARCHAR(100); SET @MyVariable = 'Test Value'; SELECT @MyVariable;"
  },
  {
    name: "XML parameter that should be skipped by SQL param highlighter",
    input: "EXECUTE ProcessXmlData @xmlPayload='<Data><Value Key=\"1\">Text</Value><Value Key=\"2\">More Text</Value></Data>'"
  },
  {
    name: "JSON parameter that should be skipped by SQL param highlighter",
    input: "EXECUTE ProcessJsonData @jsonPayload='{\"customer_id\": 123, \"items\": [{\"sku\": \"SKU001\", \"qty\": 2}]}'"
  }
];

console.log(chalk.bold.yellow("Starting SQL Highlighting Tests...\n"));

testCases.forEach(testCase => {
  console.log(chalk.bold.cyan("=================================================="));
  console.log(chalk.bold.cyan(`Test Case: ${testCase.name}`));
  console.log(chalk.cyan("==================================================\n"));
  
  console.log(chalk.gray("Input:"));
  console.log(testCase.input);
  console.log("\n");

  const highlightedOutput = highlightSql(testCase.input);
  
  console.log(chalk.gray("Output (highlighted):"));
  console.log(highlightedOutput);
  console.log("\n");
});

console.log(chalk.bold.yellow("SQL Highlighting Tests Finished.\n"));
