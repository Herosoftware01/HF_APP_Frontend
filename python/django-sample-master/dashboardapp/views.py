import datetime
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from . import models

import requests
import json
import hashlib
import hmac
import base64
from pathlib import Path
from . import global_app_settings

def index(request):
    return render(request,'index.html')

@api_view(['GET'])
def getdetails(request):
    try:
        d = global_app_settings.GlobalAppSettings.EmbedDetails
    except Exception as e:
        return JsonResponse({'error': 'Could not load embed details', 'details': str(e)}, status=500)

    return JsonResponse({
        'DashboardId': d.DashboardId,
        'ServerUrl': d.ServerUrl,
        'EmbedType': d.EmbedType,
        'Environment': d.Environment,
        'SiteIdentifier': d.SiteIdentifier,
    })

@api_view(['POST'])
def tokenGeneration(request):
    embed_details = {
        "email": global_app_settings.GlobalAppSettings.EmbedDetails.UserEmail,
        "serverurl": global_app_settings.GlobalAppSettings.EmbedDetails.ServerUrl,
        "siteidentifier": global_app_settings.GlobalAppSettings.EmbedDetails.SiteIdentifier,
        "embedsecret": global_app_settings.GlobalAppSettings.EmbedDetails.EmbedSecret,
        "dashboard": {
            "id": global_app_settings.GlobalAppSettings.EmbedDetails.DashboardId
        }
    }

    request_url = f"{embed_details['serverurl']}/api/{embed_details['siteidentifier']}/embed/authorize"
    headers = {"Content-Type": "application/json"}

    result = requests.post(request_url, headers=headers, data=json.dumps(embed_details), timeout=30)
    result.raise_for_status()

    data = result.json()
    try:
        return HttpResponse(data["Data"]["access_token"])
    except (KeyError, TypeError):
        return HttpResponse(f"Unexpected response format: {data}", status=502)