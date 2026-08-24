export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Bharat Electronics Limited (BEL) Trust Platform API',
    version: '1.0.0',
    description:
      'Enterprise Backend REST API for Sovereign Defense Asset Tokenization, Zero-Trust Access Control, Smart Contract Governance, and Audit Ledgers.',
    contact: {
      name: 'BEL Trust Platform Engineering Team',
      email: 'trust.support@bel.co.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.trust.bel.co.in/api/v1',
      description: 'Production Defense Node',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token retrieved from POST /auth/login',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-admin-01' },
          email: { type: 'string', example: 'rahul.verma@bel.co.in' },
          firstName: { type: 'string', example: 'Rahul' },
          lastName: { type: 'string', example: 'Verma' },
          role: { type: 'string', example: 'Administrator' },
          did: { type: 'string', example: 'did:bel:7f82e391a3b909f1' },
          status: { type: 'string', example: 'ACTIVE' },
        },
      },
      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ast-01' },
          name: { type: 'string', example: 'BEL Radar Sensor Mk-IV Certificate' },
          symbol: { type: 'string', example: 'BEL-RS-04' },
          category: { type: 'string', example: 'TOKENIZED_DEFENSE_HARDWARE' },
          tokenId: { type: 'string', example: '#1024' },
          contractAddress: { type: 'string', example: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5' },
          quantity: { type: 'number', example: 1 },
          marketValueUsd: { type: 'number', example: 145000 },
          currentPriceUsd: { type: 'number', example: 145000 },
          pnlPercentage: { type: 'number', example: 20.83 },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'tx-01' },
          hash: { type: 'string', example: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a9923' },
          blockNumber: { type: 'integer', example: 2345678 },
          fromAddress: { type: 'string', example: '0x0000000000000000000000000000000000000000' },
          toAddress: { type: 'string', example: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9' },
          amount: { type: 'number', example: 1 },
          usdValue: { type: 'number', example: 145000 },
          type: { type: 'string', example: 'MINT' },
          status: { type: 'string', example: 'SUCCESS' },
          network: { type: 'string', example: 'BEL Sovereign Testnet' },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'JWT login, registration, token refresh, and password recovery' },
    { name: 'Dashboard', description: 'Real-time overview metrics, charts, and blockchain node indicators' },
    { name: 'Digital Assets', description: 'Defense hardware NFT tokenization, holdings, and allocations' },
    { name: 'Transactions', description: 'On-chain transaction queries, broadcasts, and fraud indicators' },
    { name: 'Users & RBAC', description: 'Identity governance and role-based permissions' },
    { name: 'Portfolio', description: 'Asset allocation breakdowns and PnL performance trends' },
    { name: 'Wallets', description: 'Enterprise hardware & multisig wallet connections' },
    { name: 'Analytics', description: 'Growth heatmaps, throughput TPS benchmarks, and network metrics' },
    { name: 'Notifications', description: 'Security alerts and automated compliance event dispatches' },
    { name: 'Reports', description: 'Cryptographic ledger audits and export generators' },
    { name: 'Settings', description: 'System configuration and node parameters' },
    { name: 'Health Check', description: 'Liveness, readiness, and memory footprint probes' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health Check'],
        summary: 'Service Health Status',
        description: 'Returns server uptime, memory usage, and connected database/cache health.',
        responses: {
          200: { description: 'Service is operational', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticate with email and password to receive JWT access and refresh tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'rahul.verma@bel.co.in' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Successfully authenticated' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register User',
        description: 'Create a new trusted platform participant identity with verifiable DID.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', example: 'engineer@bel.co.in' },
                  password: { type: 'string', example: 'SecureP@ss123' },
                  firstName: { type: 'string', example: 'Vikram' },
                  lastName: { type: 'string', example: 'Sharma' },
                  role: { type: 'string', example: 'Engineer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User identity registered' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Current User Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard Executive KPI Summary',
        responses: {
          200: { description: 'Summary KPI metrics' },
        },
      },
    },
    '/dashboard/charts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard Charts & Role Distribution',
        responses: {
          200: { description: 'Chart data points' },
        },
      },
    },
    '/assets': {
      get: {
        tags: ['Digital Assets'],
        summary: 'List Digital Assets',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated digital assets' },
        },
      },
    },
    '/assets/mint': {
      post: {
        tags: ['Digital Assets'],
        summary: 'Mint Tokenized Asset NFT',
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Asset minted on blockchain' },
        },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List On-Chain Transactions',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated transactions ledger' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users & RBAC'],
        summary: 'List Trusted Identities',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of users' },
        },
      },
    },
    '/portfolio': {
      get: {
        tags: ['Portfolio'],
        summary: 'Portfolio Overview',
        responses: {
          200: { description: 'Portfolio valuation and performance' },
        },
      },
    },
    '/analytics/growth': {
      get: {
        tags: ['Analytics'],
        summary: 'Portfolio Growth Trends',
        responses: {
          200: { description: 'Growth time series' },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get User Notifications',
        responses: {
          200: { description: 'Notifications list' },
        },
      },
    },
    '/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List Sealed Ledger Reports',
        responses: {
          200: { description: 'Reports list' },
        },
      },
    },
    '/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get Platform Settings',
        responses: {
          200: { description: 'Settings configuration' },
        },
      },
    },
  },
};
