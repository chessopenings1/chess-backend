import { Engine } from 'node-uci'
import os from 'os'

const platform = os.platform()
let enginePath = ''
if (platform === 'darwin') {
  enginePath = 'stockfish/stockfish-macos-m1-apple-silicon'
} else if (platform === 'linux') {
  enginePath = 'stockfish 2/stockfish-ubuntu-x86-64-avx2'
}
// async/await
const engine = new Engine(enginePath)
await engine.init()
await engine.setoption('MultiPV', '4')
await engine.isready()
console.log('engine ready', engine.id, engine.options)
await engine.position('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3')
const result = await engine.go({ depth: 15 })
console.log('result', result)
await engine.quit()
 
//promises with chain
// const engine = new Engine('engine/executable/path')
// engine
//   .chain()
//   .init()
//   .setoption('MultiPV', 3)
//   .position('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3')
//   .go({ depth: 15 })
//   .then(result => {
//     console.log(result)
// })