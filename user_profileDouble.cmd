cd C:\academyHelper
cmd -new_console /k "cd C:\academyHelper\servercloud && yarn start"
cmd -new_console /k "cd C:\academyHelper\servercloud2 && yarn start"
cmd -new_console /k "cd C:\academyHelper && ngrok start --all"