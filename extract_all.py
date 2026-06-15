import zipfile
import xml.etree.ElementTree as ET
import glob
import os

files = glob.glob(r'C:\Users\ELIAS ROJAS\Documents\PORTAFOLIO FACE 3\PROYECTO FINAL DE ADSOFT\Preguntas\*.docx')

with open('extract_all.txt', 'w', encoding='utf-8') as f:
    for docx_path in files:
        f.write(f"\n{'='*50}\n")
        f.write(f"FILE: {os.path.basename(docx_path)}\n")
        f.write(f"{'='*50}\n")
        try:
            with zipfile.ZipFile(docx_path) as docx:
                xml_content = docx.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                
                text = []
                for node in tree.iter():
                    if node.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p':
                        p_text = ""
                        for t in node.findall('.//w:t', namespaces):
                            if t.text:
                                p_text += t.text
                        if p_text:
                            text.append(p_text)
                f.write("\n".join(text))
        except Exception as e:
            f.write(f"Error: {e}")
        f.write("\n")
print("Done extracting all.")
