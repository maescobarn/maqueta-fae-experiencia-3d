import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'/maqueta-fae-experiencia-3d/',plugins:[react()],cacheDir:".vite",server:{watch:{usePolling:true,useFsEvents:false}}});
