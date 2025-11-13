import qrcode
from PIL import Image


def generate_website_qr_code(url, file_path):
    """
    Gera um QR Code para uma URL específica e salva como arquivo de imagem.
    """
    qr = qrcode.QRCode(
        version=1,  
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(file_path)

    print(f"QR Code gerado e salvo como '{file_path}'")


if __name__ == "__main__":
    website_url = "https://the-garagem.vercel.app/"
    output_file = "meu_qrcode_site.png"
    generate_website_qr_code(website_url, output_file)
