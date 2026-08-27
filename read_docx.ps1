Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @(
    "C:\Users\ELIAS ROJAS\Documents\PORTAFOLIO FACE 3\PROYECTO FINAL DE ADSOFT\Preguntas\seguimineto escolar.docx",
    "C:\Users\ELIAS ROJAS\Documents\PORTAFOLIO FACE 3\PROYECTO FINAL DE ADSOFT\Preguntas\REMISION  A COOORDINACION.pdf.docx",
    "C:\Users\ELIAS ROJAS\Documents\PORTAFOLIO FACE 3\PROYECTO FINAL DE ADSOFT\Preguntas\atenciones a padres o familiares.docx"
)

foreach ($file in $files) {
    Write-Host "=== FILE: $file ==="
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($file)
        $entry = $zip.GetEntry('word/document.xml')
        $reader = New-Object System.IO.StreamReader($entry.Open())
        $text = $reader.ReadToEnd()
        $reader.Close()
        $zip.Dispose()
        $clean = $text -replace '<[^>]+>', ' ' -replace '\s+', ' '
        Write-Host $clean
    } catch {
        Write-Host "Error reading file."
    }
    Write-Host ""
}
