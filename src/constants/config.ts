import argv from 'minimist'
const args = argv(process.argv.slice(2))

export const isProduction = Boolean(args.production)
