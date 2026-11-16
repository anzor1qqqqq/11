'use strict'

const REQUESTS_COUNT = 10

async function main() {
  const url = process.argv[2]

  if (!url) {
    console.error('Использование: node speedtest.js <url>')
    process.exit(1)
  }

  try {
    new URL(url)
  } catch {
    console.error(`Некорректный адрес: ${url}`)
    process.exit(1)
  }

  console.log(`Адрес: ${url}`)
  console.log(`Запросов: ${REQUESTS_COUNT} (последовательно)\n`)

  let totalBytes = 0
  let totalTimeMs = 0
  let successCount = 0

  for (let i = 1; i <= REQUESTS_COUNT; i++) {
    const start = performance.now()
    try {
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const elapsed = performance.now() - start

      totalBytes += buffer.byteLength
      totalTimeMs += elapsed
      successCount++

      console.log(
        `#${i}: ${(buffer.byteLength / 1024).toFixed(1)} КБ за ${elapsed.toFixed(0)} мс`
      )
    } catch (err) {
      console.error(`#${i}: ошибка — ${err.message}`)
    }
  }

  if (successCount === 0) {
    console.error('\nНи один запрос не завершился успешно.')
    process.exit(1)
  }

  const avgTimeMs = totalTimeMs / successCount
  const totalSeconds = totalTimeMs / 1000
  const speedMbit = (totalBytes * 8) / totalSeconds / 1e6

  console.log('\n--- Результат ---')
  console.log(`Успешных запросов: ${successCount} из ${REQUESTS_COUNT}`)
  console.log(`Среднее время запроса: ${avgTimeMs.toFixed(0)} мс`)
  console.log(`Всего скачано: ${(totalBytes / 1024 / 1024).toFixed(2)} МБ`)
  console.log(`Скорость скачивания: ${speedMbit.toFixed(2)} Мбит/с`)
}

main()
