const https = require('https');

// Замени на свой токен
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.log('❌ Замени YOUR_BOT_TOKEN_HERE на свой токен!');
  process.exit(1);
}

console.log('🔍 Проверяем токен бота...');
console.log(`📊 Токен: ${BOT_TOKEN.substring(0, 10)}...`);

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/getMe`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.ok) {
        console.log('✅ Токен правильный!');
        console.log('🤖 Информация о боте:');
        console.log(`   ID: ${response.result.id}`);
        console.log(`   Username: @${response.result.username}`);
        console.log(`   First Name: ${response.result.first_name}`);
        console.log(`   Can Join Groups: ${response.result.can_join_groups}`);
        console.log(`   Can Read All Group Messages: ${response.result.can_read_all_group_messages}`);
        console.log(`   Supports Inline Queries: ${response.result.supports_inline_queries}`);
      } else {
        console.log('❌ Токен неправильный!');
        console.log('📋 Ошибка:', response.description);
      }
    } catch (error) {
      console.log('❌ Ошибка при парсинге ответа:', error);
      console.log('📋 Ответ сервера:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Ошибка при запросе:', error);
});

req.end();
