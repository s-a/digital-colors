# Digital Colors (dc)

`dc` is a command-line utility that enhances terminal output by adding colorization. It's designed to highlight common data formats like XML and JSON, as well as patterns such as log levels and timestamps.

You can use `dc` in two main ways:
1.  **As a command wrapper:** `dc your_command [args...]`
    *   `dc` executes `your_command` and colorizes its standard output.
2.  **As a pipe processor:** `your_command | dc`
    *   `dc` reads data from standard input (stdin), colorizes it, and prints it to standard output (stdout).

## Installation

```bash
npm i -g @s-a/digital-colors
```

## Usage Modes

### Mode 1: Executing a Command and Colorizing its Output
   (`dc your_command [args...]`)

When you provide `dc` with a command to run, it executes that command, captures its standard output, and applies colorization before printing it to your terminal.

**Key Characteristics:**
*   The first argument after `dc` is the command to be executed (e.g., `tail`, `ls`, `cat`).
*   Any subsequent arguments are passed directly to that command.
*   This mode is ideal for colorizing the output of commands directly, including long-running processes like `tail -f`.

**Examples:**

*   **Live Log Monitoring (most common use case):**
    To monitor a log file with `tail -f` and have its output colorized:
    ```bash
    dc tail -f /path/to/your/logfile.log
    ```
    (For Windows, use appropriate paths like `D:\\log\\api.log`)

*   **Colorizing Output of Short-Lived Commands:**
    ```bash
    dc ls -la
    ```
    ```bash
    dc cat /etc/hosts
    ```

### Mode 2: Processing Piped Input from Another Command
   (`your_command | dc`)

`dc` can also process data piped to its standard input. This allows you to colorize the output of any command that writes to stdout.

**Key Characteristics:**
*   `dc` reads data line by line (or in chunks) from stdin.
*   It applies colorization to the received data.
*   The colorized data is then printed to stdout.
*   This mode is useful when you want to take the output of an existing command and pass it through `dc` for colorization.

**Examples:**

*   **Colorizing the output of `cat`:**
    ```bash
    cat myapplication.log | dc
    ```
*   **Colorizing the output of `grep`:**
    ```bash
    grep "ERROR" system.log | dc
    ```
*   **Colorizing a JSON string from `echo`:**
    ```bash
    echo '{"name": "example", "value": 123}' | dc
    ```

## Understanding `dc` Behavior in Pipes

It's important to understand how `dc` behaves when used in command pipelines to avoid confusion:

1.  **`dc your_command [args...] | another_command` (Piping *from* `dc` when `dc` wraps a command):**
    *   `dc` first executes `your_command` and colorizes its output.
    *   This *colorized output* (including ANSI escape codes) is then piped to `another_command`.
    *   Example: `dc tail -f my.log | grep "ERROR"` will pass colorized lines to `grep`. This might be useful if `another_command` can handle ANSI codes (like `less -R`), but often `grep` would be better used before `dc` if you want to filter first, then colorize (see Mode 2).

2.  **`dc | another_command` (Piping *from* `dc` when `dc` has no command to run):**
    *   If `dc` is used as the first command in a pipeline *without* being given its own command to execute (e.g., `dc | grep foo`), it defaults to Mode 2 behavior: it will read from its standard input.
    *   If stdin is your terminal, `dc` will wait for you to type something. What you type will be colorized and then passed to `another_command`.
    *   **This is why `dc | tail -f /path/to/logfile.log` does not work as expected for live log monitoring.** In this case, `dc` waits for stdin, and `tail -f` would attempt to process whatever (if anything) `dc` outputs, rather than `dc` processing `tail -f`'s file monitoring output.
    *   **Correct for live log monitoring:** `dc tail -f /path/to/logfile.log` (Mode 1).

3.  **`your_command | dc | another_command` (Piping through `dc`):**
    *   `your_command` sends its output to `dc`.
    *   `dc` colorizes this output (Mode 2).
    *   The colorized output from `dc` is then piped to `another_command`.
    *   Example: `cat my.log | dc | grep "ERROR"` (again, `grep` will operate on colorized text).

**General Tip for Piping:** If you want to filter or process text *before* colorization, do it before piping to `dc` (e.g., `grep "ERROR" my.log | dc`). If you want to filter or process the *colorized* text, pipe from `dc` (e.g., `dc tail -f my.log | less -R`).

