'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function AttendanceReportForm() {
    const { id } = useParams()
    const [report, setReport] = useState<AttendanceReport | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const motorikRef = useRef<HTMLTextAreaElement | null>(null)
    const locomotorRef = useRef<HTMLTextAreaElement | null>(null)
    const bodyControlRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true)
            try {
                const token = Cookies.get('token')
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance-report/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) throw new Error('Failed to fetch report');
                const { data } = await response.json();
                console.log(data);
                setReport(data);
            } catch (error) {
                console.error('Error : ', error);
                toast.error('Error fetching report')
            } finally {
                setIsLoading(false)
            }
        }
        fetchReport()
    }, [id])

    const autoSize = (el?: HTMLTextAreaElement | null) => {
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }

    useEffect(() => {
        if (!report) return
        autoSize(motorikRef.current)
        autoSize(locomotorRef.current)
        autoSize(bodyControlRef.current)
    }, [report])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const token = Cookies.get('token')
            const payload = {
                motorik: report?.motorik,
                locomotor: report?.locomotor,
                body_control: report?.body_control,
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
            if (!response.ok) throw new Error('Failed to update report')
            toast.success('Report updated successfully')
        } catch (error) {
            console.error('Error : ', error);
            toast.error('Error updating report')
        }
    }

    if (isLoading) return <p className="px-6 py-8">Loading...</p>
    if (!report) return <p className="px-6 py-8">No report found</p>

    const ageOrBirth = (bd?: string) => {
        if (!bd) return '-'
        try {
            const d = new Date(bd)
            const diff = new Date().getFullYear() - d.getFullYear()
            return `${diff} yr (${bd})`
        } catch {
            return bd
        }
    }

    return (
        <div className="px-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Student Profile & Attendance Report</h1>
                <div className="text-sm text-muted-foreground">Schedule: <span className="font-medium">{report.schedule?.name}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Profile Card (sticky on desktop) */}
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
                                    <div className="text-sm font-medium">{report.coach ? `Coach #${report.coach.id}` : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Attendance</div>
                                    <div className="text-sm font-medium">{report.attendance === 1 ? 'Present' : 'Absent'}</div>
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
                                    <Button variant="ghost" type="button" onClick={() => {
                                        // reset to latest server state (or navigate back)
                                        setReport({ ...report })
                                        toast('No changes reverted')
                                    }}>Reset</Button>
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
