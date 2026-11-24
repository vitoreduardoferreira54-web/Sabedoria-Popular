/* Modo offline: guarda os arquivos do jogo depois da primeira visita (precisa de https) */
const VERSAO = 'sabedoria-popular-v1';
const ARQUIVOS = [
    './', './index.html', './style.css', './script.js', './manifest.webmanifest',
    './assets/icones/icone-192.png', './assets/icones/icone-512.png',
    './assets/fundos/vila_principal.png', './assets/fundos/comunidade_vila.png', './assets/fundos/tela_inicial_exemplo.png',
    './assets/cenarios/jardim.png', './assets/cenarios/cozinha.png', './assets/cenarios/trilha.png',
    './assets/personagens/jogador_parado/frame_01.png', './assets/personagens/npcs/npc_01.png',
    './assets/limpo/jogador.png', './assets/limpo/npc_1.png', './assets/limpo/npc_2.png', './assets/limpo/npc_3.png',
    './assets/limpo/npc_4.png', './assets/limpo/npc_5.png', './assets/limpo/npc_6.png',
    './assets/objetos_jogo/canteiro.png', './assets/objetos_jogo/composteira.png', './assets/objetos_jogo/fogao.png',
    './assets/objetos_jogo/mesa_caderno.png', './assets/objetos_jogo/vasos.png', './assets/objetos_jogo/placa.png',
    './assets/objetos_jogo/tronco.png', './assets/objetos_jogo/pedras.png'
];

self.addEventListener('install', (ev) => {
    ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
    ev.waitUntil(
        caches.keys().then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (ev) => {
    if (ev.request.method !== 'GET') return;
    ev.respondWith(caches.match(ev.request).then((r) => r || fetch(ev.request)));
});
