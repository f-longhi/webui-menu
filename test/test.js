import {
  FontIcon,
  Menu,
  ContextMenu,
  DropdownMenu,
  MenuBar
} from '../src/menu.js';
import * as webui from '../src/menu.js';

webui._SET_DEBUG_MODE(true);



const AVAILABLE_THEME_NAMES = [
  'win10',
  'purple7',
  'square',
  'square-dark',
  'material2',
  'phill',
];

let activeTheme = 'win10';

function setTheme(themeName) {
  activeTheme = themeName;
  document.querySelector('link#menu-theme').href = `../src/themes/${themeName}/menu.css`;
}

setTheme(activeTheme);

const menubarContainer = document.querySelector('#menubar-test');
const topMenu = new MenuBar(menubarContainer);

const fileMenu = new Menu();
topMenu.append('Arquivo', fileMenu);

fileMenu.append('Novo', {shortcut: 'Ctrl+N'});
fileMenu.append('Abrir...', {shortcut: 'Ctrl+O'});
fileMenu.append('Salvar', {shortcut: 'Ctrl+S'});
fileMenu.append('Salvar como...');
fileMenu.appendSeparator();
fileMenu.append('Imprimir');
fileMenu.appendSeparator();
fileMenu.append('Fechar');

const editMenu = new Menu();
topMenu.append('Editar', editMenu);

editMenu.append('Desfazer', {shortcut: 'Ctrl+Z'});
editMenu.appendSeparator();
editMenu.append('Recortar', {shortcut: 'Ctrl+X'});
editMenu.append('Copiar', {shortcut: 'Ctrl+C'});
editMenu.append('Colar', {shortcut: 'Ctrl+V'});
editMenu.append('Excluir', {shortcut: 'Del'});
editMenu.appendSeparator();
editMenu.append('Selecionar tudo', {shortcut: 'Ctrl+A'});

const viewMenu = new Menu();
topMenu.append('Visualizar', viewMenu);
viewMenu.append('Tema', {menu: createThemeSelectionMenu()});

topMenu.render();






function createThemeSelectionMenu() {
  const themesMenu = new Menu();

  AVAILABLE_THEME_NAMES.forEach(themeName => {
    themesMenu.append(themeName, () => {
      setTheme(themeName);
    }, {
      type: 'radio',
      group: 'themes',
      checked: themeName === activeTheme
    });
  });
  
  return themesMenu;
}


function manyOptionsMenu() {
  const m = new Menu();
  
  for (let i = 0; i < 50; i++) {
    m.append(`Opção ${i+1}`);
  }
  
  return m;
}


const colmn = new Menu();

[
  'Amigos',
  'Carros',
  'Flores',
  'Engenharia'
].forEach((cat, i) => {
  colmn.append(cat, {type: 'checkbox', checked: i%2});
});

const accessctrl = new Menu();

const rndmenu = new Menu();
for (let i =0; i<10; i++) {
  rndmenu.append(`Item ${i}`);
}


const ctx = new ContextMenu();

const instaOpts = new Menu();

instaOpts.append('Feed');
instaOpts.append('Stories');

const shareMenu = new Menu();

shareMenu.append('Facebook');
shareMenu.append('Twitter');
shareMenu.append('Instagram', {menu: instaOpts});
shareMenu.appendSeparator();
shareMenu.append('Mais serviços...')

ctx.append('Abrir', () => alert('CLICKED!'), {
  icon: new FontIcon(0xf07c, 'FontAwesome')
});
ctx.append('Abrir em outra aba', {disabled: true});

ctx.appendSeparator();

ctx.append('Compartilhar', {
  menu: shareMenu
});
ctx.append('Baixar', {
  icon: new FontIcon(0xf019, 'FontAwesome')
});
ctx.append('Salvar na coleção', {menu: colmn});


ctx.appendSeparator();

ctx.append('Várias opções', {menu: manyOptionsMenu()});

ctx.append('Tema', {menu: createThemeSelectionMenu()});

ctx.setContext(document.querySelector('#menu-context'));

const dropdown = new DropdownMenu();
dropdown.setContext(document.querySelector('#dropdown-anchor'));

dropdown.fromObject([
  {text:'Opção um'},
  {text:'Opção sete'},
  {type: 'separator'},
  {text:'Opção vinte e nove'},
  {text:'Opção dois'},
  {text:'Sem opções'},
]);

let enableDynamicMenu = true
const dyn = new Menu();


ctx.append('Menu dinâmico', {
  menu: dyn,
  onshow(menuitem) {
    menuitem.disabled = !enableDynamicMenu
  }
})


dyn.onshow = () => {
  dyn.items = [];
  
  dyn.append('uhul');
  dyn.append('Hora: ' + (new Date()).toLocaleTimeString(), {disabled: true});
}

ctx.appendSeparator()

ctx.append('Habilitar menu dinâmico', {
  type: 'checkbox',
  onclick(menuitem) {
    enableDynamicMenu = menuitem.checked
  },
  checked: enableDynamicMenu
});

