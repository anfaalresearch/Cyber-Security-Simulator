
import { useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Clock,
    Search,
    ShieldCheck,
} from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { incidentScenarios } from "../data/incidentScenarios";
import { correlateEvents } from "../utils/eventCorrelation";
import { buildIncidentTimeline } from "../utils/incidentAnalysis";
import { cn } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";

export const IncidentInvestigation = () => {
    const { completeInvestigation } = useTheme();

    const [activeIncidentId, setActiveIncidentId] = useState(
        incidentScenarios[0]?.id
    );
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([]);
    const [assessment, setAssessment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(false);

    const incident = incidentScenarios.find(
        (item) => item.id === activeIncidentId
    );

    const timeline = useMemo(
        () => buildIncidentTimeline(incident?.events || []),
        [incident]
    );

    const correlations = useMemo(
        () => correlateEvents(timeline),
        [timeline]
    );

    const selectedEvent = timeline.find(
        (event) => event.id === selectedEventId
    );

    const getCorrelations = (eventId) =>
        correlations.filter((item) =>
            item.eventIds.includes(eventId)
        );

    const toggleEvidence = (eventId) => {
        setSelectedEvidenceIds((current) =>
            current.includes(eventId)
                ? current.filter((id) => id !== eventId)
                : [...current, eventId]
        );
    };

    const expectedEvidence = incident?.expectedEvidenceIds || [];

    const correctEvidence = selectedEvidenceIds.filter((id) =>
        expectedEvidence.includes(id)
    );

    const missedEvidence = expectedEvidence.filter(
        (id) => !selectedEvidenceIds.includes(id)
    );

    const extraEvidence = selectedEvidenceIds.filter(
        (id) => !expectedEvidence.includes(id)
    );

    const isCorrect =
        assessment === incident?.expectedAssessment &&
        missedEvidence.length === 0 &&
        extraEvidence.length === 0;

    const getEventDescription = (id) =>
        timeline.find((event) => event.id === id)?.description || id;

    const assessmentLabels = {
        suspicious: "Suspicious Activity",
        benign: "Benign Activity",
        inconclusive: "Inconclusive",
    };

    const selectedAssessmentLabel =
        assessmentLabels[assessment] || "Not selected";

    const expectedAssessmentLabel =
        assessmentLabels[incident?.expectedAssessment] || "Not available";

    const submitInvestigation = () => {
        if (!assessment || selectedEvidenceIds.length === 0 || submitted) {
            return;
        }

        setSubmitted(true);

        if (isCorrect) {
            const earnedReward = completeInvestigation(incident.id);
            setXpAwarded(earnedReward);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SectionTitle
                title="Incident Investigation Lab"
                subtitle="Investigate simulated security evidence, connect related events, and reconstruct incident timelines."
                align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <CyberCard hover={false} padding="p-4">
                    <div className="flex items-center gap-3">
                        <Activity className="text-neon-cyan" size={24} />
                        <div>
                            <p className="text-sm text-slate-400">Evidence events</p>
                            <p className="text-2xl font-bold text-white">
                                {timeline.length}
                            </p>
                        </div>
                    </div>
                </CyberCard>

                <CyberCard hover={false} padding="p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-warning" size={24} />
                        <div>
                            <p className="text-sm text-slate-400">Correlations found</p>
                            <p className="text-2xl font-bold text-white">
                                {correlations.length}
                            </p>
                        </div>
                    </div>
                </CyberCard>
            </div>

            <CyberCard hover={false} padding="p-5" className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                    Select an incident
                </h2>

                <div className="flex flex-wrap gap-3">
                    {incidentScenarios.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveIncidentId(item.id);
                                setSelectedEventId(null);
                                setSelectedEvidenceIds([]);
                                setAssessment("");
                                setSubmitted(false);
                                setXpAwarded(false);
                            }}
                            className={cn(
                                "px-4 py-3 rounded-lg border text-sm transition-colors",
                                activeIncidentId === item.id
                                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                                    : "border-cyber-border text-slate-400 hover:border-neon-cyan/50"
                            )}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
            </CyberCard>

            {incident && (
                <>
                    <CyberCard hover={false} padding="p-5" className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="text-neon-green" size={20} />
                            <h2 className="text-lg font-semibold text-white">
                                {incident.title}
                            </h2>
                        </div>

                        <p className="text-slate-400 text-sm mb-3">
                            {incident.description}
                        </p>

                        <p className="text-neon-cyan text-sm">
                            Objective: {incident.objective}
                        </p>
                    </CyberCard>

                    <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 items-start">
                        <CyberCard hover={false} padding="p-5">
                            <h2 className="text-lg font-semibold text-white mb-5">
                                <Clock className="inline mr-2 text-neon-cyan" size={19} />
                                Evidence Timeline
                            </h2>

                            <div className="space-y-4">
                                {timeline.map((event) => {
                                    const related = getCorrelations(event.id);

                                    return (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedEventId(event.id)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-lg border transition-colors",
                                                selectedEventId === event.id
                                                    ? "border-neon-cyan bg-neon-cyan/10"
                                                    : "border-cyber-border bg-white/5 hover:border-neon-cyan/40"
                                            )}
                                        >
                                            <div className="flex flex-wrap justify-between gap-2 mb-2">
                                                <span className="text-xs font-mono text-neon-cyan">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>

                                                <span className="text-xs text-slate-400">
                                                    {event.severity}
                                                </span>
                                            </div>

                                            <p className="text-white text-sm font-semibold">
                                                {event.description}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-2">
                                                {event.source} · {event.id}
                                            </p>

                                            {selectedEvidenceIds.includes(event.id) && (
                                                <span className="inline-flex mt-2 px-2 py-1 rounded-md text-xs bg-neon-green/10 text-neon-green">
                                                    Evidence selected
                                                </span>
                                            )}

                                            {related.length > 0 && (
                                                <span className="inline-flex items-center gap-1 mt-3 text-xs text-warning">
                                                    <Search size={13} />
                                                    {related.length} correlation(s)
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CyberCard>

                        <div className="space-y-6">
                            <CyberCard hover={false} padding="p-5">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Evidence Details
                                </h2>

                                {selectedEvent ? (
                                    <div className="space-y-3 text-sm">
                                        <p className="text-neon-cyan font-mono">
                                            {selectedEvent.id}
                                        </p>

                                        <p className="text-slate-300">
                                            {selectedEvent.description}
                                        </p>

                                        <p className="text-slate-400">
                                            Source: {selectedEvent.source}
                                        </p>

                                        <p className="text-slate-400">
                                            User: {selectedEvent.user || "Not available"}
                                        </p>

                                        <p className="text-slate-400">
                                            IP: {selectedEvent.ip || "Not available"}
                                        </p>

                                        <button
                                            onClick={() => toggleEvidence(selectedEvent.id)}
                                            disabled={submitted}
                                            className={cn(
                                                "w-full rounded-lg border py-2 text-sm font-semibold transition-colors",
                                                selectedEvidenceIds.includes(selectedEvent.id)
                                                    ? "border-warning/40 text-warning bg-warning/10"
                                                    : "border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10",
                                                submitted && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {selectedEvidenceIds.includes(selectedEvent.id)
                                                ? "Remove from Evidence"
                                                : "Add to Evidence"}
                                        </button>

                                        <div className="pt-3 border-t border-cyber-border">
                                            <p className="text-white font-semibold mb-2">
                                                Related evidence
                                            </p>

                                            {getCorrelations(selectedEvent.id).length > 0 ? (
                                                getCorrelations(selectedEvent.id).map(
                                                    (correlation, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-xs text-warning mb-2"
                                                        >
                                                            {correlation.reasons.join(", ")}

                                                            <p className="text-slate-400 mt-1">
                                                                Related event:{" "}
                                                                {correlation.eventIds.find(
                                                                    (id) => id !== selectedEvent.id
                                                                )}
                                                            </p>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <p className="text-slate-500 text-xs">
                                                    No related evidence found.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">
                                        Select a timeline event to inspect its evidence.
                                    </p>
                                )}
                            </CyberCard>

                            <CyberCard hover={false} padding="p-5">
                                <h2 className="text-lg font-semibold text-white mb-3">
                                    Analyst Assessment
                                </h2>

                                <p className="text-sm text-slate-400 mb-4">
                                    Based on the evidence, classify this incident.
                                </p>

                                <div className="space-y-2 mb-4">
                                    {[
                                        { value: "suspicious", label: "Suspicious Activity" },
                                        { value: "benign", label: "Benign Activity" },
                                        { value: "inconclusive", label: "Inconclusive" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            disabled={submitted}
                                            onClick={() => setAssessment(option.value)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border text-sm",
                                                assessment === option.value
                                                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                                                    : "border-cyber-border text-slate-400",
                                                submitted && "opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-slate-400 mb-3">
                                    Selected evidence: {selectedEvidenceIds.length}
                                </p>

                                <button
                                    onClick={submitInvestigation}
                                    disabled={
                                        !assessment ||
                                        selectedEvidenceIds.length === 0 ||
                                        submitted
                                    }
                                    className="w-full rounded-lg bg-neon-green/10 border border-neon-green/40 text-neon-green py-3 text-sm font-semibold disabled:opacity-40"
                                >
                                    Submit Investigation
                                </button>

                                {submitted && (
                                    <div className="mt-4 space-y-4">
                                        <p
                                            className={cn(
                                                "text-sm font-semibold",
                                                isCorrect ? "text-neon-green" : "text-warning"
                                            )}
                                        >
                                            {isCorrect
                                                ? xpAwarded
                                                    ? "Correct! Investigation completed. +50 XP earned!"
                                                    : "Correct! You already completed this investigation. No additional XP awarded."
                                                : "Investigation needs improvement. Review your feedback below."}
                                        </p>

                                        {/* Assessment Review */}
                                        <div className="rounded-lg border border-cyber-border p-3 space-y-2">
                                            <h3 className="text-white font-semibold text-sm">
                                                Assessment Review
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Your classification:{" "}
                                                <span className="text-white">
                                                    {selectedAssessmentLabel}
                                                </span>
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                Expected classification:{" "}
                                                <span className="text-neon-cyan">
                                                    {expectedAssessmentLabel}
                                                </span>
                                            </p>

                                            <p
                                                className={cn(
                                                    "text-xs font-semibold",
                                                    assessment === incident.expectedAssessment
                                                        ? "text-neon-green"
                                                        : "text-warning"
                                                )}
                                            >
                                                {assessment === incident.expectedAssessment
                                                    ? "Classification is correct."
                                                    : "Classification does not match the expected answer."}
                                            </p>
                                        </div>

                                        {/* Evidence Review */}
                                        <div className="rounded-lg border border-cyber-border p-3 space-y-3">
                                            <h3 className="text-white font-semibold text-sm">
                                                Evidence Review
                                            </h3>

                                            <div>
                                                <p className="text-neon-green text-xs font-semibold mb-2">
                                                    Expected evidence selected ({correctEvidence.length})
                                                </p>

                                                {correctEvidence.length > 0 ? (
                                                    correctEvidence.map((id) => (
                                                        <p
                                                            key={id}
                                                            className="text-xs text-slate-400 mb-1"
                                                        >
                                                            ✓ {getEventDescription(id)}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-500">
                                                        No expected evidence selected.
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-warning text-xs font-semibold mb-2">
                                                    Missed evidence ({missedEvidence.length})
                                                </p>

                                                {missedEvidence.length > 0 ? (
                                                    missedEvidence.map((id) => (
                                                        <p
                                                            key={id}
                                                            className="text-xs text-slate-400 mb-1"
                                                        >
                                                            • {getEventDescription(id)}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-500">
                                                        No required evidence missed.
                                                    </p>
                                                )}
                                            </div>

                                            {extraEvidence.length > 0 && (
                                                <div>
                                                    <p className="text-neon-cyan text-xs font-semibold mb-2">
                                                        Additional evidence selected ({extraEvidence.length})
                                                    </p>

                                                    {extraEvidence.map((id) => (
                                                        <p
                                                            key={id}
                                                            className="text-xs text-slate-400 mb-1"
                                                        >
                                                            • {getEventDescription(id)}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Investigation Conclusion */}
                                        <div className="rounded-lg border border-neon-cyan/20 p-3">
                                            <h3 className="text-white font-semibold text-sm mb-2">
                                                Investigation Conclusion
                                            </h3>

                                            <p className="text-slate-400 text-sm">
                                                {incident.conclusion}
                                            </p>
                                        </div>

                                        {!isCorrect && (
                                            <button
                                                onClick={() => {
                                                    setSubmitted(false);
                                                    setXpAwarded(false);
                                                }}
                                                className="w-full rounded-lg border border-neon-cyan/40 text-neon-cyan py-2 text-sm"
                                            >
                                                Continue Investigation
                                            </button>
                                        )}
                                    </div>
                                )}
                            </CyberCard>

                            <CyberCard hover={false} padding="p-5">
                                <h2 className="text-lg font-semibold text-white mb-3">
                                    Defensive Recommendations
                                </h2>

                                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                                    {incident.recommendations.map((recommendation, index) => (
                                        <li key={index}>{recommendation}</li>
                                    ))}
                                </ul>
                            </CyberCard>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
};
