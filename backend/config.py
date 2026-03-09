import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    spotipy_client_id: str = ""
    spotipy_client_secret: str = ""
    spotipy_redirect_uri: str = "http://localhost:8000/callback"
    mp3_folder_path: str = ""
    spotify_scope: str = (
        "user-library-modify user-library-read "
        "playlist-modify-public playlist-modify-private "
        "playlist-read-private"
    )


settings = Settings()
