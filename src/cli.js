import arg from 'arg';
import inquirer from 'inquirer';

const { ApiPromise, WsProvider } = require('@polkadot/api');

const endpointKusama = 'wss://kusama-rpc.polkadot.io';
const endpointPolkadot = 'wss://rpc.polkadot.io';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--yes': Boolean,
      '--network': Boolean,
      '--block': Boolean,
      '--hash': Boolean,
      '-y': '--yes',
      '-n': '--network',
      '-b': '--block',
      '-h': '--hash',
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    skipPrompts: args['--yes'] || false,
    network: args['--network'] || false,
    block: args['--block'],
    hash: args['--hash'],
  };
}

async function promptForMissingOptions(options) {
  const defaultNetwork = "Polkadot";
  if (options.skipPrompts) {
    return {
      ...options,
      network: options.network || defaultNetwork,
    };
  }

  const questions = [];
  if (!options.network) {
    questions.push({
      type: 'list',
      name: 'network',
      message: 'Please choose which network to use',
      choices: ['Polkadot', 'Kusama'],
      default: defaultNetwork,
    });
  }

  if (!options.block) {
    questions.push({
      type: 'input',
      name: 'block',
      message: 'Provide a block number?',
      default: 0,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    network: options.network || answers.network,
    block: options.block || answers.block,
  };
}

async function getApi(endpoint) {
  const provider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider });
  return api;
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    let myapi = "";

    if (options.network === 'Kusama') {
      myapi = await getApi(endpointKusama);
    } else {
      myapi = await getApi(endpointPolkadot);
    }
    const header = await myapi.rpc.chain.getBlock();
    console.log(`Latest block information: ${header}`);
}