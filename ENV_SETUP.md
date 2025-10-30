# Environment Variables Setup

This project uses environment variables to securely store API keys and sensitive configuration.

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`:**
   ```bash
   # Open .env in your text editor
   nano .env
   # or
   code .env
   ```

3. **Get your OpenAI API key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it to your `.env` file

4. **Restart your Expo dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npx expo start
   ```

## Important Notes

- **Never commit `.env` to git!** It's already in `.gitignore`
- **Always commit `.env.example`** - This template helps other developers
- **Restart the dev server** after changing environment variables
- **Use `EXPO_PUBLIC_` prefix** for any environment variables you want to access in your app

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key for chatbot functionality | Yes |

## Security Best Practices

1. ✅ Store sensitive keys in `.env` (not in code)
2. ✅ Add `.env` to `.gitignore`
3. ✅ Use a template (`.env.example`) for documentation
4. ✅ Rotate API keys if they're ever exposed
5. ✅ Never share your `.env` file with anyone

## Troubleshooting

**Issue:** Environment variables not loading
- **Solution:** Make sure to restart the Expo dev server after creating/modifying `.env`

**Issue:** Chatbot using fallback responses
- **Solution:** Check that your API key is correct and the environment variable name matches exactly

**Issue:** "API key not found" warning
- **Solution:** Ensure your `.env` file exists and contains `EXPO_PUBLIC_OPENAI_API_KEY=your_key_here`

## Adding New Environment Variables

To add a new environment variable:

1. Add it to `.env`:
   ```bash
   EXPO_PUBLIC_NEW_VAR=value
   ```

2. Add it to `.env.example` (without the real value):
   ```bash
   EXPO_PUBLIC_NEW_VAR=your_value_here
   ```

3. Access it in your code:
   ```typescript
   const myVar = process.env.EXPO_PUBLIC_NEW_VAR;
   ```

4. Restart the dev server

---

**Note:** If you accidentally commit your `.env` file with real API keys, immediately:
1. Rotate/delete the exposed keys from your API provider
2. Remove the commit from git history
3. Generate new keys
