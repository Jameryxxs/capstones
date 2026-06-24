import os

filepath = r"c:\Users\albert\THESIS\frontend\src\pages\Analytics.jsx"

with open(filepath, 'r') as f:
    lines = f.readlines()

# find where it broke
broken_idx = 0
for i, line in enumerate(lines):
    if "<strong>Error:</strong> {error}" in line:
        broken_idx = i
        break

# The lines we want to keep are up to broken_idx + 3 (which covers the error div closing)
keep_lines = lines[:broken_idx + 3]

rest_of_file = """                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '90%', height: '80%', borderRadius: '8px', background: 'var(--border-industrial)', opacity: 0.3 }}></div>
                        </div>
                    ) : (
                        <div style={{ height: isMobile ? '300px' : '400px', width: '100%' }}>
                            <ResponsiveContainer>
                                {activeTab === 'forecast' && forecastData.length > 0 ? (
                                    <AreaChart data={forecastData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                                        <Area type="monotone" dataKey="price" stroke="var(--accent-cyan)" fill="url(#colorPrice)" strokeWidth={3} />
                                    </AreaChart>
                                ) : activeTab === 'correlation' && correlationData.length > 0 ? (
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                        <CartesianGrid stroke="var(--border-industrial)" />
                                        <XAxis type="number" dataKey="supply" name="Supply" unit="kg" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis type="number" dataKey="price" name="Price" unit="₱" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <ZAxis type="number" range={[64, 144]} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Market Data" data={correlationData} fill="var(--accent-cyan)" />
                                    </ScatterChart>
                                ) : activeTab === 'seasonality' && seasonalityData.length > 0 ? (
                                    <LineChart data={seasonalityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Line type="monotone" dataKey="volume" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-main)', stroke: 'var(--accent-cyan)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent-cyan)' }} />
                                    </LineChart>
                                ) : activeTab === 'comparison' && compareData && compareData.chart_data ? (
                                    <LineChart data={compareData.chart_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Legend />
                                        <Line type="monotone" dataKey={compareData.fish1_name} stroke="#64ffda" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey={compareData.fish2_name} stroke="#ff9f43" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : activeTab === 'historical_comparison' && historicalData && historicalData.length > 0 ? (
                                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-industrial)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{stroke: 'var(--border-industrial)'}} />
                                        <Legend />
                                        <Line type="monotone" dataKey="This Month" stroke="#64ffda" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="Last Month" stroke="#ff9f43" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : activeTab === 'suppliers' && supplierData.length > 0 ? (
                                    <BarChart data={supplierData} layout="vertical" margin={{ left: isMobile ? 10 : 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-industrial)" />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis dataKey="location" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={isMobile ? 80 : 120} />
                                        <Tooltip content={<CustomTooltip activeTab={activeTab} />} />
                                        <Bar dataKey="volume" fill="var(--accent-cyan)" name="Volume (kg)" radius={[0, 2, 2, 0]} />
                                    </BarChart>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>NO DATA POINT FOUND</p>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
                )}
            </div>
        </div>
    );
};

export default Analytics;
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(keep_lines)
    f.write(rest_of_file)
