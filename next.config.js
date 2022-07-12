module.exports = {
    async rewrites() {
      return [
        {
          source: '/.well-known/apple-developer-merchantid-domain-association.txt',
          destination: '/api/apple-developer-merchantid-domain-association',
        },
      ]
    },
  }