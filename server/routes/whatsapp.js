const express = require('express');
const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Verificación del webhook (Meta)
router.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepción de mensajes y respuesta básica tipo bot
router.post('/webhooks/whatsapp', async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;
    if (messages && messages[0]) {
      const msg = messages[0];
      const from = msg.from; // número del cliente (incluye prefijo país)
      const text = (msg.text?.body || '').toLowerCase();

      let reply = 'Hola, somos RunaWay. ¿Qué servicio necesitas?\n1) Llantas\n2) Aceite\n3) Mecánica rápida';
      if (text.includes('1') || text.includes('llanta')) reply = 'Para llantas, indícanos medida (ej. 205/55R16) y marca preferida.';
      else if (text.includes('2') || text.includes('aceite')) reply = 'Para cambio de aceite, dinos tipo (10W40, 20W50) y marca.';
      else if (text.includes('3') || text.includes('mecánica')) reply = 'Para mecánica rápida, cuéntanos el síntoma (frenos, suspensión, etc.).';

      if (PHONE_NUMBER_ID && WHATSAPP_TOKEN) {
        await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: { body: reply },
          }),
        });
      } else {
        console.warn('WhatsApp env vars faltantes: WHATSAPP_TOKEN y/o WHATSAPP_PHONE_NUMBER_ID');
      }
    }
  } catch (err) {
    console.error('Error en webhook de WhatsApp:', err);
  }
  return res.sendStatus(200);
});

module.exports = router;