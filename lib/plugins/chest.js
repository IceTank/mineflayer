function callbackifyWithOptionalArguments (f) {
  return function (...args) {
    const cb = args[args.length - 1]
    return f(...args).then(r => {
      if (cb && typeof cb === 'function') { cb(undefined, r) }
      return r
    }, err => { if (cb && typeof cb === 'function') { cb(err) } else throw err })
  }
}

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:generic', 'minecraft:chest', 'minecraft:dispenser', 'minecraft:shulker_box', 'minecraft:hopper']

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openContainer (containerToOpen, direction = null, cursorPos = null) {
    let chest
    if (containerToOpen.constructor.name === 'Block') {
      chest = await bot.openBlock(containerToOpen, direction, cursorPos)
    } else if (containerToOpen.constructor.name === 'Entity') {
      chest = await bot.openEntity(containerToOpen)
    } else {
      throw new Error('containerToOpen is neither a block nor an entity')
    }

    if (!matchWindowType(chest)) { throw new Error('Non-container window used as a container') }
    return chest
  }

  bot.openContainer = callbackifyWithOptionalArguments(openContainer)
  bot.openChest = callbackifyWithOptionalArguments(openContainer)
  bot.openDispenser = callbackifyWithOptionalArguments(openContainer)
}
