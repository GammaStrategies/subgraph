const { Command } = require("commander");
const { exec } = require("child_process");
const fs = require("fs");

const program = new Command();

function getConfigPath(protocol, network) {
  return `config/${protocol}/${network}.json`;
}

function getConfig(protocol, network) {
  const configPath = getConfigPath(protocol, network);

  if (!fs.existsSync(configPath)) {
    console.log(`${configPath} not found`);
    return null;
  }

  const config = JSON.parse(fs.readFileSync(configPath));
  return config;
}

function prepareSubgraph(protocol, network) {
  const configPath = getConfigPath(protocol, network);
  const config = getConfig(protocol, network);
  if (!config) {
    return;
  }

  const templatePath = `templates/${config.subgraphTemplate}.template.yaml`;

  if (!fs.existsSync(templatePath)) {
    console.log(`${templatePath} not found`);
    return;
  }
  exec(
    `node_modules/.bin/mustache ${configPath} ${templatePath} > subgraph.yaml`
  );
  console.log("Prepared subgraph.yaml for", { protocol, network });
}

program
  .command("prepare")
  .arguments("<protocol> <network>")
  .action((protocol, network) => {
    prepareSubgraph(protocol, network);
  });

program
  .command("deploy")
  .arguments("<protocol> <network> <version>")
  .action((protocol, network, version) => {
    const config = getConfig(protocol, network);
    if (!config) {
      return;
    }

    if (!config.deploymentName) {
      console.log(`Missing deployment name for ${protocol}/${network}`);
      return;
    }

    // exec("node_modules/.bin/graph codegen").stdout.pipe(process.stdout);
    // exec("node_modules/.bin/graph build").stdout.pipe(process.stdout);

    if (config.deploymentService == "goldsky") {
      exec(
        `goldsky subgraph deploy ${config.deploymentName}/${version} --path .`
      ).stdout.pipe(process.stdout);
    } else {
      exec(
        `node_modules/.bin/graph deploy --studio ${config.deploymentName} --version-label ${version}`
      ).stdout.pipe(process.stdout);
    }
  });

program.parse(process.argv);
