import qrcode
from PIL import Image

def generate_website_qr_code(url, file_path):
    """
    Gera um QR Code para uma URL específica e salva como arquivo de imagem.
    
    Args:
        url (str): O endereço do site para o qual o QR Code deve redirecionar.
        file_path (str): O nome do arquivo onde a imagem do QR Code será salva.
    """
    # Cria uma instância do objeto QRCode
    qr = qrcode.qrcode.Image.Image(
        version=1,  # Controla o tamanho do QR Code (1 é o menor, 40 é o maior)
        error_correction=qrcode.constants.ERROR_CORRECT_L, # Nível de correção de erro
        box_size=10, # Tamanho de cada "caixa" (pixel) do QR Code
        border=4, # Espessura da borda (mínimo é 4)
    )
    
    # Adiciona os dados (a URL) ao QR Code
    qr.add_data(url)
    qr.make(fit=True) # Ajusta o tamanho para caber todos os dados

    # Cria a imagem do QR Code
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Salva a imagem em um arquivo
    img.save(file_path)
    
    print(f"QR Code gerado e salvo como '{file_path}'")

# Exemplo de uso:
website_url = "https://the-garagem-git-main-asafes-projects-a46561d5.vercel.app/"

output_file = "meu_qrcode_site.png"

generate_website_qr_code(website_url, output_file)
