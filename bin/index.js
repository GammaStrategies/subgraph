const { Command } = require("commander");
const { exec } = require("child_process");
const fs = require("fs");

const program = new Command();

program
  .command("prepare")
  .arguments("<protocol> <network>")
  .action((protocol, network, template) => {
    const configPath = `config/${protocol}/${network}.json`;

    if (!fs.existsSync(configPath)) {
      console.log(`${configPath} not found`);
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath));
    const templatePath = `templates/${config.subgraphTemplate}.template.yaml`;

    if (!fs.existsSync(templatePath)) {
      console.log(`${templatePath} not found`);
      return;
    }
    exec(
      `node_modules/.bin/mustache ${configPath} ${templatePath} > subgraph.yaml`
    );
    console.log("Prepared subgraph.yaml for", { protocol, network });
  });

program.parse(process.argv);
