Set WshShell = CreateObject("WScript.Shell")
htmlPath = Replace(WScript.ScriptFullName, "Launch_Trachtenberg_Studio.vbs", "index.html")
WshShell.Run "cmd /c start """" """ & htmlPath & """", 0, False
