$ErrorActionPreference='Stop'
$ProjectRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SavedPassword=$env:PGPASSWORD
try {
 $env:PGPASSWORD=[IO.File]::ReadAllText((Join-Path $ProjectRoot '.local/postgres-password.local')).Trim()
 $Psql='C:\laragon\bin\postgresql\postgresql-14.5-1\bin\psql.exe'
 $DbArgs=@('-X','-h','127.0.0.1','-p','55432','-U','postgres','-d','juniormark','-v','ON_ERROR_STOP=1')
 foreach($Item in @(@('archive_items','003_archive_items.sql'),@('user_notes','006_account_features.sql'))) {
  $Exists=& $Psql @DbArgs -tAc "select to_regclass('public.$($Item[0])') is not null"
  if($LASTEXITCODE -ne 0){throw 'Cannot connect to project database.'}
  if($Exists.Trim() -eq 'f') {
   & $Psql @DbArgs -f (Join-Path $ProjectRoot ('supabase/'+$Item[1]))
   if($LASTEXITCODE -ne 0){throw "Migration failed: $($Item[1])"}
  }
 }
 & $Psql @DbArgs -c "select table_name from information_schema.tables where table_schema='public' and table_name in ('fan_profiles','archive_items','user_settings','user_notes') order by table_name"
 if($LASTEXITCODE -ne 0){throw 'Verification failed.'}
} finally {$env:PGPASSWORD=$SavedPassword}
