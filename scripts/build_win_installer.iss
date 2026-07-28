; Draft2Desk Inno Setup Script for Windows Installer
; Compiles dist/Draft2DeskServer into Draft2DeskSetup.exe

[Setup]
AppId={{DRAFT2DESK-WORD-ADDIN-001}}
AppName=Draft2Desk Word Add-in
AppVersion=1.0.1
AppPublisher=Draft2Desk Team
DefaultDirName={autopf}\Draft2Desk
DefaultGroupName=Draft2Desk
OutputBaseFilename=Draft2DeskSetup
Compression=lzma2/max
SolidCompression=yes
PrivilegesRequired=lowest

[Files]
Source: "..\dist\Draft2DeskServer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\manifest.xml"; DestDir: "{userappdata}\Microsoft\Word\AddIns"; Flags: ignoreversion

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk"; ValueType: string; ValueName: "Url"; ValueData: "{userappdata}\Microsoft\Word\AddIns"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk"; ValueType: dword; ValueName: "Flags"; ValueData: "1"; Flags: uninsdeletekey

[Run]
Filename: "{app}\Draft2DeskServer.exe"; Description: "Launch Draft2Desk Server"; Flags: nowait postinstall skipifsilent

[Code]
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then
  begin
    if MsgBox('Do you want to keep your templates database (draft2desk.db)?', mbConfirmation, MB_YESNO) = IDNO then
    begin
      DeleteFile(ExpandConstant('{app}\draft2desk.db'));
    end;
  end;
end;
