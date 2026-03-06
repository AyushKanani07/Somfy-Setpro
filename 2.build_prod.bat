echo #################### Remix BUILD STARTED  ####################
call npm run remix:prod
echo #################### Remix BUILD COMPLETED  ####################
echo #################### ELECTRON BUILD STARTED  ####################
call npm run electron:prod
echo ############# .exe Generated Successfully  ####################
echo ############# exe Generated Successfully. Path: /release  ####################
@REM echo ############# Press Enter to close this window  ####################
pause
