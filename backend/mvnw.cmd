@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one or more
@REM contributor license agreements. See NOTICE for additional information.
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET %%__MVNW_ARG0_NAME__%%=

@SETLOCAL

@SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@IF NOT "%MAVEN_PROJECTBASEDIR%"=="" GOTO endDetectBasedir

@SET EXEC_DIR=%CD%
@SET WDIR=%EXEC_DIR%
:findBaseDir
@IF EXIST "%WDIR%"\.mvn GOTO baseDirFound
@CD ..
@IF "%WDIR%"=="%CD%" GOTO baseDirNotFound
@SET WDIR=%CD%
@GOTO findBaseDir

:baseDirFound
@SET MAVEN_PROJECTBASEDIR=%WDIR%
@CD "%EXEC_DIR%"
@GOTO endDetectBasedir

:baseDirNotFound
@SET MAVEN_PROJECTBASEDIR=%EXEC_DIR%
@CD "%EXEC_DIR%"

:endDetectBasedir

@IF NOT "%MVNW_USERNAME%"=="" (SET MVNW_USER_HOME=%USERPROFILE%)
@IF "%MVNW_USER_HOME%"=="" (SET MVNW_USER_HOME=%USERPROFILE%)

@SET MAVEN_USER_HOME=%MVNW_USER_HOME%\.m2
@SET MAVEN_WRAPPER_JAR=%MAVEN_USER_HOME%\wrapper\dists\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties

@FOR /F "usebackq tokens=1,2 delims==" %%a IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    @IF "%%a"=="distributionUrl" SET DISTRIBUTION_URL=%%b
)

@SET WRAPPER_VERSION=3.3.2
@SET WRAPPER_JAR_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/%WRAPPER_VERSION%/maven-wrapper-%WRAPPER_VERSION%.jar

@IF NOT EXIST "%MAVEN_USER_HOME%\wrapper\dists" (
    @MKDIR "%MAVEN_USER_HOME%\wrapper\dists" 2>NUL
)

@REM Download wrapper jar if needed
@IF NOT EXIST "%MAVEN_WRAPPER_JAR%" (
    @ECHO Downloading Maven Wrapper jar...
    @powershell -Command "Invoke-WebRequest -Uri '%WRAPPER_JAR_URL%' -OutFile '%MAVEN_WRAPPER_JAR%'" 2>NUL
    @IF NOT EXIST "%MAVEN_WRAPPER_JAR%" (
        @ECHO Failed to download wrapper jar. Please install Maven manually.
        @EXIT /B 1
    )
)

@SET JAVA_HOME_OPTS=
@IF NOT "%JAVA_HOME%"=="" SET JAVA_HOME_OPTS=-Djava.home="%JAVA_HOME%"

@SET MVNW_CMD="%JAVA_HOME%\bin\java.exe"
@IF "%JAVA_HOME%"=="" SET MVNW_CMD=java.exe

%MVNW_CMD% %JAVA_HOME_OPTS% -classpath "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %* -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%"

@IF ERRORLEVEL 1 GOTO error
@GOTO end

:error
@SET ERROR_CODE=%ERRORLEVEL%

:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%

@IF NOT "%MVNW_VERBOSE%"=="true" GOTO exit
@ECHO.
@ECHO ERROR %ERROR_CODE%

:exit
@EXIT /B %ERROR_CODE%
