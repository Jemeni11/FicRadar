import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: '../public/icon.png',
    developmentIndicator: 'overlay',
  },
  vite: () => ({
    server: {
      cors: {
        origin: '*',
      },
    },
    plugins: [babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  }),
  webExt: {
    disabled: true,
  },
  manifest: {
    host_permissions: [
      'https://forum.questionablequesting.com/members/*.*',
      'https://forums.spacebattles.com/members/*.*',
      'https://forum.spacebattles.com/members/*.*',
      'https://forums.sufficientvelocity.com/members/*.*',
      'https://forum.sufficientvelocity.com/members/*.*',
    ],
    browser_specific_settings: {
      gecko: {
        id: 'ficradar@Jemeni11.github.com',
        strict_min_version: '79.0',
      },
      gecko_android: {
        strict_min_version: '79.0',
      },
    },
    permissions: ['storage'],
  },
})
