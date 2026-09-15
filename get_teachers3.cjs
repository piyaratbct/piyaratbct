const https = require('https');

const projectId = 'gen-lang-client-0549870883';
const databaseId = 'ai-studio-ec31579a-db84-4704-8763-3621d8afe195';
const apiKey = 'AIzaSyDocxQRoGYG2o1M2qQZuiAt7sE_IjqeBOk';

const options = {
  hostname: 'firestore.googleapis.com',
  path: `/v1/projects/${projectId}/databases/${databaseId}/documents/teachers?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    if (!json.documents) {
       console.log("Response:", data);
       return;
    }
    json.documents.forEach(doc => {
       const fields = doc.fields;
       if (fields && fields.thaiName) {
          console.log("Teacher:", fields.thaiName.stringValue);
       }
    });
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
