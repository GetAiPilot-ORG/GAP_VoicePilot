# Vomyra API Endpoints

This document lists all available Vomyra API endpoints based on the official documentation at [Vomyra API Reference](https://docs.vomyra.com/docs/api-reference/).

All requests should be prefixed with the Base URL: `https://api.vomyra.com` and must include your API key in the `x-api-key` header.

## Catalog
- **Get Catalog**
  `GET /v1/catalog`
  *(Documentation: /docs/api-reference/catalog)*

## Assistants
- **List Assistants**
  `GET /v1/assistants`
  *(Documentation: /docs/api-reference/assistants/list)*

- **Create Assistant**
  `POST /v1/assistants`
  *(Documentation: /docs/api-reference/assistants/create)*

- **Get Assistant**
  `GET /v1/assistants/{assistant_id}`
  *(Documentation: /docs/api-reference/assistants/get)*

- **Update Assistant**
  `PUT /v1/assistants/{assistant_id}`
  *(Documentation: /docs/api-reference/assistants/update)*

- **Assign Tool**
  `POST /v1/assistants/{assistant_id}/tools` (or equivalent endpoint for tool assignment)
  *(Documentation: /docs/api-reference/assistants/assign-tool)*

- **Unassign Tool**
  `DELETE /v1/assistants/{assistant_id}/tools/{tool_id}` (or equivalent endpoint for tool unassignment)
  *(Documentation: /docs/api-reference/assistants/unassign-tool)*

## Calls
- **List Calls**
  `GET /v1/calls`
  *(Documentation: /docs/api-reference/calls/list)*

- **Initiate Call**
  `POST /v1/calls`
  *(Documentation: /docs/api-reference/calls/create)*

- **Get Call**
  `GET /v1/calls/{call_id}`
  *(Documentation: /docs/api-reference/calls/get)*

## Phone Numbers
- **List Numbers**
  `GET /v1/numbers`
  *(Documentation: /docs/api-reference/phone-numbers/list)*

- **Assign Number**
  `PUT /v1/numbers/assignment`
  *(Documentation: /docs/api-reference/phone-numbers/assign)*

- **Unassign Number**
  `DELETE /v1/numbers/assignment`
  *(Documentation: /docs/api-reference/phone-numbers/unassign)*

## Tools
- **List Tool Types**
  `GET /v1/tools/types`
  *(Documentation: /docs/api-reference/tools/types)*

- **List Tools**
  `GET /v1/tools`
  *(Documentation: /docs/api-reference/tools/list)*

- **Create Tool**
  `POST /v1/tools`
  *(Documentation: /docs/api-reference/tools/create)*
