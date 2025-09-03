'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


interface AttendanceReport {
    id: number
    schedule_id: number
    coach_id: number
    play_kid_id: number
    attendance: number
    motorik: string | null
    locomotor: string | null
    body_control: string | null
    overall: number | null
    created_at: string
    updated_at: string
    schedule: {
        id: number
        class_id: number
        name: string
        date: string
        start_time: string
        end_time: string
        quota: number
        venue_id: number
        created_at: string | null
        updated_at: string | null
        class_model: {
            id: number
            name: string
            sport_id: number
            category_id: number
            branch_id: number
            created_at: string | null
            updated_at: string | null
        }
    }
    coach: {
        id: number
        user_id: number
        birth_date: string | null
        description: string | null
        photo: string | null
        created_at: string | null
        updated_at: string | null
        user: {
            name: string
        }
    }
    play_kid: {
        id: number
        parent_id: number
        name: string
        nick_name: string
        birth_date: string
        gender: string
        photo: string | null
        medical_history: string | null
        school_origin: string | null
        created_at: string | null
        updated_at: string | null
    }
}

interface Session {
    id: number;
    coach: {
        id: number;
    };
    name: string;
    role: string;
}

export default function AttendanceReportForm() {
    const { id } = useParams()
    const [report, setReport] = useState<AttendanceReport | null>(null);
    const [defaultReport, setDefaultReport] = useState<AttendanceReport | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [coaches, setCoaches] = useState<{ id: number; name: string }[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const motorikRef = useRef<HTMLTextAreaElement | null>(null);
    const locomotorRef = useRef<HTMLTextAreaElement | null>(null);
    const bodyControlRef = useRef<HTMLTextAreaElement | null>(null);

    const fetchReport = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            const sessionString = Cookies.get("session_key");
            if (!sessionString) return null;

            const sessionKey = JSON.parse(sessionString);
            console.log("session : ", sessionKey);

            const token = Cookies.get("token");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch report");

            const { data } = await response.json();
            console.log(data);

            setReport(data);
            setDefaultReport(data);
            setSession(sessionKey);
        } catch (error) {
            console.error("Error : ", error);
            toast.error("Error fetching report");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) fetchReport(String(id));
    }, [id, fetchReport]);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const token = Cookies.get("token");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/coach`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!response.ok) throw new Error("Failed to fetch coaches")
                const { data } = await response.json()
                setCoaches(data)
            } catch (error) {
                console.error(error)
                toast.error("Error fetching coaches")
            }
        }

        if (session?.role === "admin") {
            fetchCoaches()
        }
    }, [session])

    const autoSize = (el?: HTMLTextAreaElement | null) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }

    useEffect(() => {
        if (!report) return;
        autoSize(motorikRef.current);
        autoSize(locomotorRef.current);
        autoSize(bodyControlRef.current);
    }, [report]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            console.log("SESSION_KEY : ", session)
            const payload = {
                coach_id: session?.role === "coach" ? session.coach.id : report?.coach_id,
                motorik: report?.motorik,
                locomotor: report?.locomotor,
                body_control: report?.body_control,
                attendance: report?.attendance,
                overall: report?.overall,
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error('Failed to update report');

            await fetchReport(String(id));
            toast.success('Report updated successfully');
        } catch (error) {
            console.error('Error : ', error);
            toast.error('Error updating report');
        }
    }

    const handleReset = () => {
        setReport(defaultReport);
        toast.info('Changes reverted to last saved state');
    }

    if (isLoading) return <p className="px-6 py-8">Loading...</p>
    if (!report || !defaultReport) return <p className="px-6 py-8">No report found</p>

    const ageOrBirth = (bd?: string) => {
        if (!bd) return '-';
        try {
            const birth = new Date(bd);
            const now = new Date();
            let age = now.getFullYear() - birth.getFullYear();
            const m = now.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
                age--;
            }
            return `${age} yrs`;
        } catch {
            return bd;
        }
    }

    console.log("coaches : ", coaches);

    return (
        <div className="px-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Student Profile & Attendance Report</h1>
                <div className="text-sm text-muted-foreground">Schedule: <span className="font-medium">{report.schedule?.name}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <aside className="md:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    {report.play_kid?.photo ? (
                                        <AvatarImage src={report.play_kid.photo} alt={report.play_kid?.name} />
                                    ) : (
                                        <AvatarFallback>{(report.play_kid?.name || 'U').slice(0, 1)}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <div className="text-lg font-semibold">{report.play_kid?.name}</div>
                                    <div className="text-sm text-muted-foreground">{report.play_kid?.nick_name ? `“${report.play_kid.nick_name}”` : null}</div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Birth</span>
                                    <span className="text-sm font-medium">{report.play_kid?.birth_date ? report.play_kid.birth_date : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Age</span>
                                    <span className="text-sm font-medium">{ageOrBirth(report.play_kid?.birth_date)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Gender</span>
                                    <Badge className='rounded-full'>{report.play_kid?.gender ?? '-'}</Badge>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm text-muted-foreground">School</div>
                                    <div className="text-sm font-medium">{report.play_kid?.school_origin ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Medical</div>
                                    <div className="text-sm">{report.play_kid?.medical_history ?? '—'}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm text-muted-foreground">Coach</div>
                                    <div className="text-sm font-medium">{report.coach ? `${report.coach.user.name}` : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Attendance</div>
                                    <div className="text-sm font-medium">{defaultReport.attendance === 1 ? 'Present' : 'Absent'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </aside>

                {/* Right: Form area */}
                <main className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assessment</CardTitle>
                                <CardDescription>Enter notes for Motorik, Locomotor, Body Control, and the Overall rating.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {session?.role === "admin" ? (
                                        <div className="lg:col-span-2 space-y-1">
                                            <Label htmlFor="coach">Coach</Label>
                                            <Select
                                                value={report.coach_id ? String(report.coach_id) : ""}
                                                onValueChange={(val) => {
                                                    setReport({
                                                        ...report,
                                                        coach_id: Number(val),
                                                    })
                                                }}
                                            >
                                                <SelectTrigger id="coach" className="w-full">
                                                    <SelectValue placeholder="Select coach" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {coaches.map(c => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">Choose the coach who filled this assessment.</p>
                                        </div>
                                    ) : null}
                                    <div className="space-y-2">
                                        <Label htmlFor="motorik">Motorik</Label>
                                        <Textarea
                                            id="motorik"
                                            ref={motorikRef}
                                            value={report.motorik ?? ''}
                                            onChange={(e) => {
                                                setReport({ ...report, motorik: e.target.value })
                                                autoSize(e.target)
                                            }}
                                            onInput={(e) => autoSize(e.currentTarget)}
                                            placeholder="Write motorik notes..."
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="locomotor">Locomotor</Label>
                                        <Textarea
                                            id="locomotor"
                                            ref={locomotorRef}
                                            value={report.locomotor ?? ''}
                                            onChange={(e) => {
                                                setReport({ ...report, locomotor: e.target.value })
                                                autoSize(e.target)
                                            }}
                                            onInput={(e) => autoSize(e.currentTarget)}
                                            placeholder="Write locomotor notes..."
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="body_control">Body Control</Label>
                                        <Textarea
                                            id="body_control"
                                            ref={bodyControlRef}
                                            value={report.body_control ?? ''}
                                            onChange={(e) => {
                                                setReport({ ...report, body_control: e.target.value })
                                                autoSize(e.target)
                                            }}
                                            onInput={(e) => autoSize(e.currentTarget)}
                                            placeholder="Write body control notes..."
                                            className="min-h-[100px] resize-none"
                                        />
                                    </div>
                                    {/* Attendance select (shadcn Select) */}
                                    <div className="space-y-1">
                                        <Label htmlFor="attendance">Attendance</Label>
                                        <Select
                                            value={String(report.attendance ?? 0)}
                                            onValueChange={(val) => setReport({ ...report, attendance: Number(val) })}
                                        >
                                            <SelectTrigger id="attendance" className="w-full">
                                                <SelectValue placeholder="Select attendance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Present</SelectItem>
                                                <SelectItem value="0">Absent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Mark whether the student was present for this session.</p>
                                    </div>
                                    {/* Overall (1-5) select (shadcn Select) */}
                                    <div className="space-y-1">
                                        <Label htmlFor="overall">Overall (1–5)</Label>
                                        <Select
                                            value={report.overall !== null ? String(report.overall) : ''}
                                            onValueChange={(val) => {
                                                const parsed = val ? Number(val) : null
                                                setReport({ ...report, overall: parsed })
                                            }}
                                        >
                                            <SelectTrigger id="overall" className="w-full">
                                                <SelectValue placeholder="Select rating" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2</SelectItem>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="4">4</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Overall rating (1 = low, 5 = excellent).</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-4">
                                    <Button variant="ghost" type="button" onClick={() => { handleReset() }}>Reset</Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </main>
            </div>
        </div>
    )
}
