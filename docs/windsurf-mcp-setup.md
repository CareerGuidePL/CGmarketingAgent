# Windsurf — konfiguracja MCP dla n8n

Windsurf nie obsługuje project-level MCP config. Serwer `n8n-mcp` trzeba dodać **globalnie**.

## Konfiguracja

Otwórz plik `~/.codeium/windsurf/mcp_config.json` (Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`)
lub w Windsurf: **Settings > Manage MCP Servers > View raw config**.

Dodaj serwer `n8n-mcp`:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true"
      }
    }
  }
}
```

## Opcjonalnie: dostep do instancji n8n

Dodaj zmienne srodowiskowe w sekcji `env`:

```json
"N8N_API_URL": "https://twoja-instancja.example",
"N8N_API_KEY": "klucz-z-n8n-settings-api"
```

## Weryfikacja

Po zapisaniu konfiguracji i restarcie Windsurf, narzedzia n8n-mcp powinny byc dostepne w Cascade.
