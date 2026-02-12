# API Reference

Base URL (local): `http://localhost:3001`

## 1) Health Check

### Request
`GET /api/health`

### Response
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T18:00:00.000Z",
  "uptime": 123.456
}
```

---

## 2) Generate Document

### Request
`POST /api/generate`

Content-Type: `multipart/form-data`

Required form fields:
- `sowFile` (file: `.pdf`, `.docx`, `.txt`)
- `platform` (`aws` | `azure`)
- `documentType` (`hld` | `lld`)
- `projectDetails` (JSON string)

Optional form fields:
- `additionalInfo` (string)

`projectDetails` JSON shape:
```json
{
  "projectName": "string",
  "clientName": "string",
  "authorName": "string",
  "version": "1.0",
  "region": "string"
}
```

### Success Response
```json
{
  "success": true,
  "downloadUrl": "/api/download/uuid_Project_HLD_v1.0.docx",
  "filename": "Project_HLD_v1.0.docx",
  "generatedAt": "2026-02-12T18:05:00.000Z"
}
```

### Validation Errors
```json
{
  "success": false,
  "error": "Invalid platform. Must be \"aws\" or \"azure\""
}
```

Common errors:
- Missing file
- Invalid file extension
- File exceeds max size
- Invalid `projectDetails` JSON
- Missing required `projectDetails` fields

---

## 3) Download Document

### Request
`GET /api/download/:filename`

### Success
Returns DOCX binary stream with:
- `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `Content-Disposition: attachment; filename="..."`

### Error (Not Found)
```json
{
  "success": false,
  "error": "File not found"
}
```

---

## cURL Examples

### Generate HLD (AWS)
```bash
curl -X POST "http://localhost:3001/api/generate" \
  -F "sowFile=@./sample.docx" \
  -F "platform=aws" \
  -F "documentType=hld" \
  -F "additionalInfo=Include standard NTT controls" \
  -F "projectDetails={\"projectName\":\"Demo\",\"clientName\":\"Acme\",\"authorName\":\"Promit\",\"version\":\"1.0\",\"region\":\"ap-southeast-1 (Singapore)\"}"
```

### Download generated file
```bash
curl -L "http://localhost:3001/api/download/<filename>" -o output.docx
```
