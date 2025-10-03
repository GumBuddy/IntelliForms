const request = require('supertest');
const { generateUploadUrl } = require('./scr/generateUploadUrl');
const { notifyFileUploaded } = require('./scr/notifyFileUploaded');

describe('generateUploadUrl (unit)', () => {
  test('rechaza extensiones no permitidas', async () => {
    await expect(generateUploadUrl.generateSignedUrl('test', '.exe')).rejects.toThrow(/Extensión de archivo no permitida/);
  });
  test('acepta extensiones permitidas', async () => {
    const allowed = ['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    for (const ext of allowed) {
      await expect(generateUploadUrl.generateSignedUrl('test', ext)).resolves.toHaveProperty('signedUrl');
    }
  });
});

describe('notifyFileUploaded (unit)', () => {
  test('falla si falta fileName', async () => {
    const req = { method: 'POST', body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await notifyFileUploaded(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
