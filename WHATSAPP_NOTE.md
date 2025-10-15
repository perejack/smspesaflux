# WhatsApp Integration Note

## Current Status: SMS Only

The FluxSMS API (PesaFlux) currently **only supports SMS messaging**, not WhatsApp.

### What This Means:

1. **Channel Selection** - The "WhatsApp" option in the UI is currently non-functional
2. **All Messages** - Will be sent via SMS regardless of channel selection
3. **API Limitation** - This is a limitation of the FluxSMS API, not the application

### Future WhatsApp Integration Options:

If you need WhatsApp messaging, you would need to:

1. **Use WhatsApp Business API** (Official)
   - Requires Facebook Business verification
   - Costs: ~$0.005-0.01 per message
   - Providers: Twilio, MessageBird, 360Dialog

2. **Use Third-Party WhatsApp APIs**
   - Services like WATI, Interakt, or AiSensy
   - Usually have monthly subscriptions
   - Easier setup than official API

3. **Contact PesaFlux**
   - Ask if they plan to add WhatsApp support
   - They may have it in development

### Current Workaround:

For now, the application will:
- Send all messages via SMS
- The "channel" parameter is ignored by the API
- Messages will still be delivered successfully via SMS

### Recommendation:

- **Remove WhatsApp option** from the UI, or
- **Add a note** that WhatsApp is "Coming Soon"
- **Keep the code structure** ready for future WhatsApp integration

---

**Last Updated:** October 15, 2025
