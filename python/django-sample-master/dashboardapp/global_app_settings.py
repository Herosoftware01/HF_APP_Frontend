from dataclasses import dataclass
from pathlib import Path
import json


@dataclass
class EmbedDetails:
    Environment: str = None
    SiteIdentifier: str = None
    ServerUrl: str = None
    EmbedSecret: str = None
    UserEmail: str = None
    EmbedType: str = None
    DashboardId: str = None


class GlobalAppSettings:
    EmbedDetails: EmbedDetails = EmbedDetails()


def load_embed_details():
    """Load embedConfig.json and populate GlobalAppSettings.EmbedDetails."""
    config_path = Path(__file__).resolve().parents[1] / 'embedConfig.json'
    with open(config_path, 'r', encoding='utf-8-sig') as f:
        cfg = json.load(f)
    embed = cfg.get('EmbedDetails', cfg)

    GlobalAppSettings.EmbedDetails = EmbedDetails(
        Environment=embed.get('Environment') or embed.get('environment'),
        SiteIdentifier=embed.get('SiteIdentifier') or embed.get('siteIdentifier') or embed.get('siteidentifier'),
        ServerUrl=embed.get('ServerUrl') or embed.get('serverUrl') or embed.get('serverurl'),
        EmbedSecret=embed.get('EmbedSecret') or embed.get('embedSecret') or embed.get('embedsecret'),
        UserEmail=embed.get('UserEmail') or embed.get('userEmail') or embed.get('email'),
        EmbedType=embed.get('EmbedType') or embed.get('embedType') or embed.get('embedtype'),
        DashboardId=embed.get('DashboardId') or embed.get('dashboardId') or (embed.get('Dashboard') or {}).get('id')
    )


# Load on import if possible; fail silently so Django can still start
try:
    load_embed_details()
except Exception:
    pass
