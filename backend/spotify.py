import spotipy
from spotipy.oauth2 import SpotifyOAuth

from config import settings

# Module-level state for the Spotify client
_sp: spotipy.Spotify | None = None
_auth_manager: SpotifyOAuth | None = None


def get_auth_manager() -> SpotifyOAuth:
    global _auth_manager
    if _auth_manager is None:
        _auth_manager = SpotifyOAuth(
            client_id=settings.spotipy_client_id,
            client_secret=settings.spotipy_client_secret,
            redirect_uri=settings.spotipy_redirect_uri,
            scope=settings.spotify_scope,
            cache_path=".spotify_cache",
            open_browser=False,
        )
    return _auth_manager


def get_spotify() -> spotipy.Spotify | None:
    """Return authenticated Spotify client, or None if not yet authorized."""
    global _sp
    auth = get_auth_manager()
    token_info = auth.get_cached_token()
    if token_info is None:
        return None
    _sp = spotipy.Spotify(auth_manager=auth)
    return _sp


def get_auth_url() -> str:
    """Get the Spotify authorization URL for the user to visit."""
    return get_auth_manager().get_authorize_url()


def handle_callback(code: str) -> bool:
    """Exchange the authorization code for an access token."""
    global _sp
    auth = get_auth_manager()
    try:
        auth.get_access_token(code, as_dict=False)
        _sp = spotipy.Spotify(auth_manager=auth)
        return True
    except Exception:
        return False
