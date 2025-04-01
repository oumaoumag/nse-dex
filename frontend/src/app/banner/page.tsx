'use client';

import React, { useState } from 'react';
import TajiriBanner from '@/components/TajiriBanner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CameraIcon, Copy } from 'lucide-react';

export default function BannerPage() {
    const [width, setWidth] = useState(1200);
    const [height, setHeight] = useState(300);

    const handleTakeScreenshot = () => {
        // In a real implementation, this would use a library like html-to-image
        alert('To take a screenshot: \n1. On Windows: Press Win+Shift+S \n2. On Mac: Press Cmd+Shift+4 \n3. On Linux: Use the Screenshot tool');
    };

    const copyComponentCode = () => {
        const code = `<TajiriBanner width={${width}} height={${height}} />`;
        navigator.clipboard.writeText(code);
        alert('Component code copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl">Tajiri Banner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 rounded-lg bg-decode-black/50 flex items-center justify-center mb-6">
                            <TajiriBanner width={width} height={height} responsive={false} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Number(e.target.value))}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button onClick={handleTakeScreenshot} className="flex items-center gap-2">
                                <CameraIcon className="h-4 w-4" />
                                Take Screenshot
                            </Button>
                            <Button onClick={copyComponentCode} variant="outline" className="flex items-center gap-2">
                                <Copy className="h-4 w-4" />
                                Copy Component Code
                            </Button>
                        </div>

                        <div className="mt-6 bg-gray-900 p-4 rounded-lg font-mono text-green-400 overflow-x-auto">
                            <pre>{`<TajiriBanner width={${width}} height={${height}} />`}</pre>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">How to use</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Adjust the dimensions using the controls above</li>
                                <li>Take a screenshot of the banner</li>
                                <li>Use the image in your marketing materials</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 