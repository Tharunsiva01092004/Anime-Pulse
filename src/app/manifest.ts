import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AnimePulse',
        short_name: 'AnimePulse',
        description: 'Real-time Anime Schedule & Dashboard',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#00ffff',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
