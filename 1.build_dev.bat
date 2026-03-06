echo #################### Remix BUILD STARTED  ####################
call npm run remix:dev
echo #################### Remix BUILD COMPLETED  ####################
echo #################### ELECTRON BUILD STARTED  ####################
call npm run electron:dev
echo #################### ELECTRON BUILD COMPLETED  ####################
echo ############# exe Generated Successfully. Path: /release  ####################
@REM echo ############# Press Enter to close this window  ####################
pause
