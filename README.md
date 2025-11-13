# Projeto The Garage - Gerador de QR Code

Este repositório contém um gerador simples de QR Code em Python.

Dependências:

- qrcode[pil]
- Pillow

Instalação (recomenda-se criar um virtualenv):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

Uso:

```powershell
python generate_qrcode.py
```

Isso criará o arquivo `meu_qrcode_site.png` no diretório do projeto.
