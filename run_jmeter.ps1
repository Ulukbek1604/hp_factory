$JMETER  = "C:\Users\aisbe\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat"
$JMX_TPL = "$PSScriptRoot\jmeter_test.jmx"
$TMP_JMX = "$PSScriptRoot\jmeter_tmp.jmx"

foreach ($users in 50, 100, 500, 1000) {
    Write-Host "`n=== Run: $users users ===" -ForegroundColor Cyan

    # substitute user count directly into JMX
    (Get-Content $JMX_TPL -Raw) `
        -replace '\$\{__P\(users,\d+\)\}', $users `
        -replace '\$\{__P\(rampup,\d+\)\}', 10 |
        Set-Content $TMP_JMX -Encoding UTF8

    $out = "$PSScriptRoot\results_${users}.jtl"
    Remove-Item $out -ErrorAction SilentlyContinue

    & $JMETER -n -t $TMP_JMX -l $out

    if (Test-Path $out) {
        Write-Host "--- Results ($users users) ---" -ForegroundColor Yellow
        Import-Csv $out -Encoding UTF8 | Group-Object label | ForEach-Object {
            $samples = $_.Count
            $errors  = ($_.Group | Where-Object { $_.success -eq 'false' }).Count
            $avgMs   = [math]::Round(($_.Group | ForEach-Object { [int]$_.elapsed } | Measure-Object -Average).Average)
            $errPct  = [math]::Round(($errors / $samples) * 100, 1)
            Write-Host ("{0,-25} samples={1,4}  avg={2,5} ms  errors={3} ({4}%)" -f $_.Name, $samples, $avgMs, $errors, $errPct)
        }
    } else {
        Write-Host "No results file created - check if Django server is running on localhost:8000" -ForegroundColor Red
    }
}

Remove-Item $TMP_JMX -ErrorAction SilentlyContinue
Write-Host "`nDone." -ForegroundColor Green
