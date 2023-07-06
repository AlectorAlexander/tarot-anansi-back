// create-modules.js
const shell = require('shelljs');

const modules = process.argv.slice(2).toString().split(',');

modules.forEach((module) => {
  const moduleName = module.trim();
  const modulePath = `src/modules/${moduleName}`;

  // Create directories
  shell.mkdir('-p', `${modulePath}/controller`);
  shell.mkdir('-p', `${modulePath}/dtos`);
  shell.mkdir('-p', `${modulePath}/entities`);
  shell.mkdir('-p', `${modulePath}/service`);

  // Create files with basic content
  shell.ShellString(`export class ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller {}`).to(`${modulePath}/controller/${moduleName}.controller.ts`);
  shell.ShellString(`export class ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Dto {}`).to(`${modulePath}/dtos/${moduleName}.dtos.ts`);
  shell.ShellString(`export class ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Entity {}`).to(`${modulePath}/entities/${moduleName}.entity.ts`);
  shell.ShellString(`export class ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service {}`).to(`${modulePath}/service/${moduleName}.service.ts`);

  // Create module file
  shell.ShellString(`
import { Module } from '@nestjs/common';
import { ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller } from './controller/${moduleName}.controller';
import { ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service } from './service/${moduleName}.service';

@Module({
  controllers: [${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Controller],
  providers: [${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service],
})
export class ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module {}
`).to(`${modulePath}/${moduleName}.module.ts`);
});
