<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reinward from IQC — SCHILLER Healthcare India</title>
    
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --navy: #0D1B2A;
            --red: #C8102E;
            --white: #FFFFFF;
            --fog: #F0F4F8;
            --steel: #6B8CAE;
            --mid: #2C4A6E;
            --text: #1A2B3C;
            --amber: #C77B12;
            --green: #1E7B4D;
            --sidebar-w: 248px;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Calibri', Calibri, sans-serif;
            color: var(--text);
            background: var(--fog);
            line-height: 1.5;
            min-height: 100vh;
        }

        /* ───────────────────────── SIDEBAR ───────────────────────── */
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: var(--sidebar-w);
            background: var(--navy);
            display: flex;
            flex-direction: column;
            z-index: 200;
            transition: transform 0.25s ease;
        }

        .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 22px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sidebar-logo-mark {
            width: 34px;
            height: 34px;
            min-width: 34px;
            background: var(--red);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sidebar-logo-mark svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        .sidebar-brand {
            font-family: 'Calibri', Calibri, sans-serif;
            font-size: 1.02rem;
            font-weight: 700;
            color: var(--white);
            letter-spacing: 0.02em;
            line-height: 1.2;
        }

        .sidebar-brand span {
            color: var(--red);
        }

        .sidebar-brand small {
            display: block;
            font-family: 'Calibri', Calibri, sans-serif;
            font-size: 0.62rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 2px;
        }

        .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            padding: 18px 14px;
        }

        .nav-group-label {
            font-size: 0.64rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.28);
            padding: 14px 12px 8px;
        }

        .nav-group-label:first-child {
            padding-top: 4px;
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 6px;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.58);
            font-size: 0.85rem;
            font-weight: 500;
            margin-bottom: 2px;
            position: relative;
            transition: background 0.15s, color 0.15s;
        }

        .sidebar-link svg {
            width: 18px;
            height: 18px;
            min-width: 18px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.7;
        }

        .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.9);
        }

        .sidebar-link.active {
            background: rgba(200, 16, 46, 0.14);
            color: var(--white);
        }

        .sidebar-link.active::before {
            content: '';
            position: absolute;
            left: -14px;
            top: 8px;
            bottom: 8px;
            width: 3px;
            background: var(--red);
            border-radius: 0 3px 3px 0;
        }

        .sidebar-link .badge {
            margin-left: auto;
            background: var(--red);
            color: white;
            font-size: 0.66rem;
            font-weight: 700;
            padding: 1px 7px;
            border-radius: 20px;
            line-height: 1.5;
        }

        .sidebar-foot {
            padding: 16px 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sidebar-avatar {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 50%;
            background: var(--mid);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.74rem;
            font-weight: 700;
            color: white;
        }

        .sidebar-user-name {
            font-size: 0.78rem;
            font-weight: 600;
            color: white;
        }

        .sidebar-user-role {
            font-size: 0.68rem;
            color: rgba(255, 255, 255, 0.4);
        }

        /* ───────────────────────── MAIN ───────────────────────── */
        .main {
            margin-left: var(--sidebar-w);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .topbar {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            background: var(--white);
            border-bottom: 1px solid rgba(13, 27, 42, 0.08);
            padding: 0 32px;
            height: 68px;
        }

        .topbar-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .menu-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            color: var(--navy);
        }

        .menu-toggle svg {
            width: 20px;
            height: 20px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
        }

        .topbar-tabs {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--fog);
            border-radius: 8px;
            padding: 4px;
        }

        .topbar-tab {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: none;
            background: transparent;
            color: var(--steel);
            font-size: 0.8rem;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            font-family: 'Calibri', Calibri, sans-serif;
        }

        .topbar-tab svg {
            width: 15px;
            height: 15px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
        }

        .topbar-tab:hover {
            color: var(--navy);
        }

        .topbar-tab.active {
            background: white;
            color: var(--navy);
            box-shadow: 0 1px 3px rgba(13, 27, 42, 0.12);
        }

        .topbar-tab.active.tab-accepted {
            color: var(--green);
        }

        .topbar-tab.active.tab-rejected {
            color: var(--red);
        }

        .topbar-right {
            display: flex;
            align-items: center;
            gap: 18px;
        }

        .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--fog);
            border-radius: 6px;
            padding: 8px 14px;
            min-width: 240px;
        }

        .search-box svg {
            width: 16px;
            height: 16px;
            stroke: var(--steel);
            fill: none;
            stroke-width: 2;
        }

        .search-box input {
            border: none;
            background: none;
            outline: none;
            font-size: 0.82rem;
            color: var(--text);
            width: 100%;
            font-family: 'Calibri', Calibri, sans-serif;
        }

        .search-box input::placeholder {
            color: #9ab0c2;
        }

        .icon-btn {
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 8px;
            border: 1px solid rgba(13, 27, 42, 0.08);
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--mid);
            transition: background 0.15s;
        }

        .icon-btn:hover {
            background: var(--fog);
        }

        .icon-btn svg {
            width: 17px;
            height: 17px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.8;
        }

        .btn-outline-navy {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 1.5px solid rgba(13, 27, 42, 0.14);
            color: var(--navy);
            background: white;
            padding: 9px 16px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: border-color 0.15s, background 0.15s;
        }

        .btn-outline-navy:hover {
            border-color: var(--steel);
            background: var(--fog);
        }

        .btn-outline-navy svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
        }

        /* ───────────────────────── CONTENT ───────────────────────── */
        .content {
            flex: 1;
            padding: 28px 32px 60px;
        }

        .page-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 26px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .page-head h1 {
            font-family: 'Calibri', Calibri, sans-serif;
            font-size: 1.7rem;
            font-weight: 700;
            color: var(--navy);
            margin-bottom: 6px;
        }

        .page-head p {
            font-size: 0.86rem;
            color: var(--steel);
            max-width: 520px;
        }

        .head-actions {
            display: flex;
            gap: 10px;
        }

        .save-toast {
            position: fixed;
            top: 24px;
            right: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #1E7B4D;
            color: white;
            border-radius: 8px;
            padding: 14px 20px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(30, 123, 77, 0.25);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
        }

        .save-toast.show {
            opacity: 1 !important;
            transform: translateY(0) !important;
            pointer-events: auto !important;
        }

        /* KPI cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            margin-bottom: 28px;
        }

        .kpi-card {
            background: white;
            border-radius: 10px;
            padding: 18px 20px;
            border: 1px solid rgba(13, 27, 42, 0.06);
            position: relative;
            overflow: hidden;
        }

        .kpi-card::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--navy);
        }

        .kpi-card.c-navy::before { background: var(--mid); }
        .kpi-card.c-green::before { background: var(--green); }
        .kpi-card.c-red::before { background: var(--red); }
        .kpi-card.c-amber::before { background: var(--amber); }

        .kpi-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .kpi-icon {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--fog);
        }

        .kpi-icon svg {
            width: 16px;
            height: 16px;
            stroke: var(--navy);
            fill: none;
            stroke-width: 1.8;
        }

        .kpi-card.c-green .kpi-icon { background: rgba(30, 123, 77, 0.1); }
        .kpi-card.c-green .kpi-icon svg { stroke: var(--green); }
        .kpi-card.c-red .kpi-icon { background: rgba(200, 16, 46, 0.1); }
        .kpi-card.c-red .kpi-icon svg { stroke: var(--red); }
        .kpi-card.c-amber .kpi-icon { background: rgba(199, 123, 18, 0.1); }
        .kpi-card.c-amber .kpi-icon svg { stroke: var(--amber); }

        .kpi-value {
            font-family: 'Calibri', Calibri, sans-serif;
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--navy);
            line-height: 1.1;
        }

        .kpi-label {
            font-size: 0.72rem;
            color: var(--steel);
            margin-top: 5px;
            font-weight: 500;
        }

        /* Banner info */
        .report-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(44, 74, 110, 0.05);
            border: 1px solid rgba(44, 74, 110, 0.15);
            border-radius: 8px;
            padding: 12px 18px;
            margin-bottom: 22px;
            font-size: 0.82rem;
            color: var(--mid);
            font-weight: 500;
        }

        .report-banner svg {
            width: 18px;
            height: 18px;
            min-width: 18px;
            stroke: var(--mid);
            fill: none;
            stroke-width: 2.2;
        }

        /* Panel */
        .panel {
            background: white;
            border-radius: 10px;
            border: 1px solid rgba(13, 27, 42, 0.06);
            margin-bottom: 20px;
        }

        .panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 22px;
            border-bottom: 1px solid var(--fog);
        }

        .panel-head h2 {
            font-family: 'Calibri', Calibri, sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--navy);
        }

        .panel-head .panel-sub {
            font-size: 0.74rem;
            color: var(--steel);
            margin-top: 2px;
            font-weight: 400;
            font-family: 'Calibri', Calibri, sans-serif;
        }

        /* Table */
        table.iqc-table {
            width: 100%;
            border-collapse: collapse;
        }

        .iqc-table thead th {
            text-align: left;
            font-size: 0.66rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--steel);
            padding: 12px 22px;
            border-bottom: 1px solid var(--fog);
            white-space: nowrap;
        }

        .iqc-table tbody td {
            padding: 14px 22px;
            font-size: 0.82rem;
            color: var(--text);
            border-bottom: 1px solid var(--fog);
            white-space: nowrap;
        }

        .iqc-table tbody tr:last-child td {
            border-bottom: none;
        }

        .iqc-table tbody tr {
            transition: background 0.15s;
        }

        .iqc-table tbody tr.group-row:hover {
            background: #fafcfe;
        }

        .cell-part {
            font-weight: 600;
            color: var(--navy);
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 4px 11px;
            border-radius: 20px;
        }

        .status-pill::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
        }

        .status-pill.accepted {
            background: rgba(30, 123, 77, 0.1);
            color: var(--green);
        }

        .status-pill.rejected {
            background: rgba(200, 16, 46, 0.1);
            color: var(--red);
        }

        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 64px 24px;
            color: var(--steel);
        }

        .empty-state svg {
            width: 44px;
            height: 44px;
            stroke: var(--steel);
            fill: none;
            stroke-width: 1.4;
            margin-bottom: 16px;
            opacity: 0.6;
        }

        .empty-state strong {
            font-family: 'Calibri', Calibri, sans-serif;
            color: var(--navy);
            font-size: 1.02rem;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .empty-state p {
            font-size: 0.82rem;
            max-width: 280px;
        }

        /* Sidebar scrim */
        .sidebar-scrim {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(13, 27, 42, 0.5);
            z-index: 150;
        }

        .sidebar-scrim.show {
            display: block;
        }

        /* ───────────────────────── RESPONSIVE ───────────────────────── */
        @media (max-width: 1200px) {
            .kpi-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 860px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.open {
                transform: translateX(0);
            }

            .main {
                margin-left: 0;
            }

            .menu-toggle {
                display: flex;
            }

            .search-box {
                display: none;
            }

            .kpi-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 560px) {
            .content {
                padding: 20px 16px 40px;
            }

            .topbar {
                padding: 0 16px;
            }

            .kpi-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

    <div class="sidebar-scrim" id="scrim"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
            <div class="sidebar-logo-mark">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12h4l2-7 3 14 3-10 2 3h4" stroke="white" stroke-width="2.2" stroke-linecap="round"
                        stroke-linejoin="round" fill="none" />
                </svg>
            </div>
            <div class="sidebar-brand">SCHILLER <span>India</span>
                <small>Quality Systems</small>
            </div>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-group-label">Overview</div>
            <a href="production.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
                Dashboard
            </a>

            <div class="nav-group-label">Material Flow</div>
            <a href="inwardp.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M21 12H9M14 6l7 6-7 6" />
                    <path d="M3 6v12" />
                </svg>
                Inward from IQC
                <span class="badge" id="productionInwardBadge">0</span>
            </a>
            <a href="acceptedpro.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accepted
            </a>
            <a href="rejectedpro.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Rejected
                <span class="badge" id="productionRejectedBadge">0</span>
            </a>
            <a href="reinwardpro.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Completed
                <span class="badge" id="productionReInwardBadge">0</span>
            </a>
            <a href="firstrep.html" class="sidebar-link active">
                <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                Reinward from IQC
            </a>

            <div class="nav-group-label">Shop Floor</div>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M6 10l2 2 4-5 2 3 2-2" />
                </svg>
                Work Orders
            </a>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                </svg>
                Assembly Lines
            </a>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                    <path d="M14 3v5h5" />
                </svg>
                Production Reports
            </a>



            <div class="nav-group-label">System</div>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-.33-1.82L4.6 13.1a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 9a1.65 1.65 0 001-1.51V7a2 2 0 014 0v.09A1.65 1.65 0 0015 9a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019 13a1.65 1.65 0 00.33 1.82z" />
                </svg>
                Settings
            </a>
        </nav>

        <div class="sidebar-foot">
            <div class="sidebar-avatar">RM</div>
            <div>
                <div class="sidebar-user-name">R. Menon</div>
                <div class="sidebar-user-role">QC Manager · Puducherry</div>
            </div>
        </div>
    </aside>

    <!-- MAIN -->
    <div class="main">

        <div class="topbar">
            <div class="topbar-left">
                <button class="menu-toggle" id="menuToggle">
                    <svg viewBox="0 0 24 24">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div
                    style="font-family: 'Calibri', Calibri, sans-serif; font-size:1.2rem; font-weight:700; color:var(--navy);">
                    Reinward from IQC
                </div>
            </div>
            <div class="topbar-right">
                <div class="search-box">
                    <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" id="searchInput" placeholder="Search model, part no..." />
                </div>
                <button class="icon-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <span class="dot"></span>
                </button>
                <button class="icon-btn">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 2-3 4" />
                        <path d="M12 17h.01" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="content">

            <!-- Toast notification -->
            <div class="save-toast" id="saveToast">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2.4; min-width: 16px;">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
                <span>Sent to Completed successfully.</span>
            </div>

            <div class="page-head">
                <div>
                    <h1 id="pageTitle">Reinward from IQC (Accepted)</h1>
                    <p id="pageDescription">Stage-wise quantity tracking for entries that have successfully cleared the In-Process QC stage.</p>
                </div>
                <div class="head-actions">
                    <button class="btn-outline-navy" id="exportBtn">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            

            <!-- Report Banner -->
            <div class="report-banner" id="reportBanner">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span id="bannerText">This report displays all quality entries logged across Incoming QC, Production, and In-Process QC stages.</span>
            </div>

            <!-- Table panel -->
            <div class="panel">
                <div class="panel-head">
                    <div>
                        <h2 id="tableTitle">Accepted Report Register</h2>
                        <div class="panel-sub"><span id="entryCount">0</span> lots shown</div>
                    </div>
                </div>

                <div id="tableWrap">
                    <table class="iqc-table">
                        <thead>
                            <tr>
                                <th>Sl. No.</th>
                                <th>Log Date</th>
                                <th>Model</th>
                                <th id="inwardColHeader" style="text-align: right; padding: 12px 22px;">Total Inward</th>
                                <th id="iqcColHeader" style="text-align: right; padding: 12px 22px;">IQC</th>
                                <th id="proColHeader" style="text-align: right; padding: 12px 22px;">Production</th>
                                <th id="ipqcColHeader" style="text-align: right; padding: 12px 22px;">In-Process QC</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="entryTableBody"></tbody>
                    </table>
                </div>

                <div class="empty-state" id="emptyState" style="display:none;">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <strong>No entries found</strong>
                    <p>No records match your filters or there is no data logged for this view.</p>
                </div>
            </div>

        </div>
    </div>

        /* ── Sidebar toggle ── */
        const sidebar = document.getElementById('sidebar');
        const scrim = document.getElementById('scrim');
        const menuToggle = document.getElementById('menuToggle');

        function openSidebar() { sidebar.classList.add('open'); scrim.classList.add('show'); }
        function closeSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
        menuToggle.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
        scrim.addEventListener('click', closeSidebar);

        /* ── Helpers ── */
        function formatDateDisplay(isoDate) {
            if (!isoDate) return '—';
            const d = isoDate.split('T')[0];
            const [y, m, day] = d.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
        }

        function getStageStyles(stage) {
            if (stage === 'Incoming QC') {
                return 'background: rgba(44, 74, 110, 0.1); color: var(--mid);';
            } else if (stage === 'Production') {
                return 'background: rgba(199, 123, 18, 0.1); color: var(--amber);';
            } else {
                return 'background: rgba(30, 123, 77, 0.1); color: var(--green);';
            }
        }

        /* ── State variables ── */
        let activeTab = 'accepted'; // 'accepted' or 'rejected'
        let dataSets = {
            accepted: { main: [] },
            rejected: { main: [] }
        };
        let inwardList = [];

        const tableBody = document.getElementById('entryTableBody');
        const tableWrap = document.getElementById('tableWrap');
        const emptyState = document.getElementById('emptyState');
        const entryCount = document.getElementById('entryCount');
        const searchInput = document.getElementById('searchInput');

        /* ── Load data ── */
        async function fetchAllData() {
            try {
                const [
                    inwardItems,
                    acceptedIqc,
                    rejectedIqc,
                    rejectedPro,
                    rejectedIp
                ] = await Promise.all([
                    fetch('/api/inward').then(r => r.ok ? r.json() : []),
                    fetch('/api/accepted-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejected-iqc').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejectedpro').then(r => r.ok ? r.json() : []),
                    fetch('/api/rejected-ipqc').then(r => r.ok ? r.json() : [])
                ]);

                inwardList = inwardItems;
                dataSets.accepted.iqc = acceptedIqc;
                dataSets.rejected.iqc = rejectedIqc;
                dataSets.rejected.pro = rejectedPro;
                dataSets.rejected.ip = rejectedIp;

                // Union and mark source stage
                dataSets.accepted.main = [
                    ...acceptedIqc.map(item => ({ ...item, stage: 'Incoming QC' }))
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                let extractedRejected = [];
                rejectedIqc.forEach(item => {
                    if (item.itemDetails && item.itemDetails.length > 0) {
                        item.itemDetails.forEach(subItem => {
                            if (subItem.isReplaced) {
                                extractedRejected.push({
                                    ...item,
                                    quantity: subItem.qty || 1,
                                    repSerialNo: subItem.repSerialNo,
                                    additionalRemarks: subItem.additionalRemarks,
                                    remarks: (subItem.nature || '') + (subItem.serial ? ' (SN: ' + subItem.serial + ')' : ''),
                                    stage: 'Incoming QC'
                                });
                            }
                        });
                    } else if (item.isReplaced) {
                        extractedRejected.push({ ...item, stage: 'Incoming QC' });
                    }
                });
                dataSets.rejected.main = extractedRejected.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                updateUI();
            } catch (err) {
                console.error('Error fetching report data:', err);
                updateUI();
            }
        }

        /* ── Tab Switching ── */
        window.switchTab = function(tab) {
            activeTab = tab;
            
            // Toggle active classes on tab buttons
            const tabAcc = document.getElementById('tabAccepted');
            if (tabAcc) tabAcc.classList.toggle('active', tab === 'accepted');

            // Update Page headers & titles
            const titleEl = document.getElementById('pageTitle');
            const descEl = document.getElementById('pageDescription');
            const bannerText = document.getElementById('bannerText');
            const tableTitle = document.getElementById('tableTitle');
            const kpiFinalCard = document.getElementById('kpiFinalCard');

            if (tab === 'accepted') {
                titleEl.textContent = 'Reinward from IQC';
                descEl.textContent = 'Traced items showing which stage they cleared successfully.';
                bannerText.textContent = 'This report contains all entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Report Register';
                
                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-green';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Accepted ';
                document.getElementById('kpiProLabel').textContent = 'Production Accepted ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Accepted ';
            } else {
                titleEl.textContent = 'Reinward from IQC (Rejected)';
                descEl.textContent = 'Traced rejected items showing which stage they failed and got rejected.';
                bannerText.textContent = 'This report contains all rejected entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Rejected Report Register';

                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-red';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Rejected ';
                document.getElementById('kpiProLabel').textContent = 'Production Rejected ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Rejected ';
            }

            updateUI();
        };

        function groupEntries(mainData, proList, iqcList) {

                // Add the ticked (replaced) items to the Accepted tab because they passed now
                dataSets.accepted.main = [
                    ...dataSets.accepted.main,
                    ...extractedRejected
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                // Rejected tab should have all actual rejected items
                dataSets.rejected.main = [
                    ...rejectedIqc.map(item => ({ ...item, stage: 'Incoming QC' })),
                    ...rejectedPro.map(item => ({ ...item, stage: 'Production' })),
                    ...rejectedIp.map(item => ({ ...item, stage: 'In-Process QC' }))
                ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                updateUI();
            } catch (err) {
                console.error('Error fetching report data:', err);
                updateUI();
            }
        }

        /* ── Tab Switching ── */
        window.switchTab = function(tab) {
            activeTab = tab;
            
            // Toggle active classes on tab buttons
            const tabAcc = document.getElementById('tabAccepted');
            if (tabAcc) tabAcc.classList.toggle('active', tab === 'accepted');

            // Update Page headers & titles
            const titleEl = document.getElementById('pageTitle');
            const descEl = document.getElementById('pageDescription');
            const bannerText = document.getElementById('bannerText');
            const tableTitle = document.getElementById('tableTitle');
            const kpiFinalCard = document.getElementById('kpiFinalCard');

            if (tab === 'accepted') {
                titleEl.textContent = 'Reinward from IQC';
                descEl.textContent = 'Traced items showing which stage they cleared successfully.';
                bannerText.textContent = 'This report contains all entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Report Register';
                
                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-green';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Accepted ';
                document.getElementById('kpiProLabel').textContent = 'Production Accepted ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Accepted ';
            } else {
                titleEl.textContent = 'Reinward from IQC (Rejected)';
                descEl.textContent = 'Traced rejected items showing which stage they failed and got rejected.';
                bannerText.textContent = 'This report contains all rejected entries logged across Incoming QC, Production, and In-Process QC stages.';
                tableTitle.textContent = 'Rejected Report Register';

                // Color tweaks for KPI final card
                kpiFinalCard.className = 'kpi-card accent c-red';
                document.getElementById('kpiIqcLabel').textContent = 'IQC Rejected ';
                document.getElementById('kpiProLabel').textContent = 'Production Rejected ';
                document.getElementById('kpiFinalLabel').textContent = 'In-Process Rejected ';
            }

            updateUI();
        };

        function groupEntries(mainData, proList, iqcList) {
            const groups = {};
            mainData.forEach(e => {
                const d = e.date ? e.date.split('T')[0] : '';
                const key = d + '|' + e.model;
                if (!groups[key]) {
                    groups[key] = { date: d, model: e.model, partsMap: {}, parts: [], inwardTotal: 0, iqcTotal: 0, proTotal: 0, ipqcTotal: 0, rejections: [] };
                }
                
                const partNo = e.partNo;
                if (!groups[key].partsMap[partNo]) {
                    groups[key].partsMap[partNo] = {
                        partNo: partNo,
                        partDescription: e.partDescription || e.description || '-',
                        inwardQty: 0,
                        iqcQty: 0,
                        proQty: 0,
                        ipqcQty: 0,
                        iqcItem: null,
                        proItem: null,
                        ipqcItem: null,
                        repSerialNo: '',
                        additionalRemarks: '',
                        reportedDate: '',
                        remarks: ''
                    };
                }
                
                if (e.repSerialNo) {
                    groups[key].partsMap[partNo].repSerialNo = groups[key].partsMap[partNo].repSerialNo 
                        ? groups[key].partsMap[partNo].repSerialNo + ', ' + e.repSerialNo 
                        : e.repSerialNo;
                }
                if (e.additionalRemarks) {
                    groups[key].partsMap[partNo].additionalRemarks = groups[key].partsMap[partNo].additionalRemarks 
                        ? groups[key].partsMap[partNo].additionalRemarks + ' | ' + e.additionalRemarks 
                        : e.additionalRemarks;
                }
                if (e.reportedDate) {
                    groups[key].partsMap[partNo].reportedDate = e.reportedDate;
                }
                if (e.remarks) {
                    groups[key].partsMap[partNo].remarks = groups[key].partsMap[partNo].remarks 
                        ? groups[key].partsMap[partNo].remarks + ' | ' + e.remarks 
                        : e.remarks;
                }
                
                const qty = Number(e.quantity || e.qty || 0);
                if (e.stage === 'Incoming QC') {
                    groups[key].partsMap[partNo].iqcQty += qty;
                    groups[key].partsMap[partNo].iqcItem = { id: e._id, stage: 'IQC', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                } else if (e.stage === 'Production') {
                    groups[key].partsMap[partNo].proQty += qty;
                    groups[key].partsMap[partNo].proItem = { id: e._id, stage: 'Production', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                } else if (e.stage === 'In-Process QC') {
                    groups[key].partsMap[partNo].ipqcQty += qty;
                    groups[key].partsMap[partNo].ipqcItem = { id: e._id, stage: 'In-Process QC', quantity: qty, sentToReInward: e.sentToReInward, reInwarded: e.reInwarded };
                }

                if (activeTab === 'rejected') {
                    let dbStage = '';
                    if (e.stage === 'Incoming QC') dbStage = 'IQC';
                    else if (e.stage === 'Production') dbStage = 'Production';
                    else if (e.stage === 'In-Process QC') dbStage = 'In-Process QC';
                    
                    if (dbStage) {
                        groups[key].rejections.push({
                            id: e._id,
                            stage: dbStage,
                            sentToReInward: e.sentToReInward || false,
                            reInwarded: e.reInwarded || false
                        });
                    }
                }
            });

            const lots = Object.values(groups);

            lots.forEach(lot => {
                Object.values(lot.partsMap).forEach(part => {
                    // Fill inwardQty from matching records in Inward table
                    const inwardMatches = inwardList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                    part.inwardQty = inwardMatches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);

                    // Try to fill IQC Qty from matching records in IQC table if not already resolved
                    if (part.iqcQty === 0) {
                        const matches = iqcList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                        part.iqcQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }
                    // Try to fill Production Qty from matching records in Production table if not already resolved
                    if (part.proQty === 0) {
                        const matches = proList.filter(p => p.partNo === part.partNo && p.model === lot.model);
                        part.proQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }
                    // Try to fill IPQC Qty from matching records in IPQC table if not already resolved
                    if (part.ipqcQty === 0) {
                        const matches = mainData.filter(p => p.stage === 'In-Process QC' && p.partNo === part.partNo && p.model === lot.model);
                        part.ipqcQty = matches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);
                    }

                    // Always calculate rejected quantities for the dropdown
                    const rejectedIqcMatches = dataSets.rejected.iqc.filter(p => p.partNo === part.partNo && p.model === lot.model);
                    part.iqcRejectedQty = rejectedIqcMatches.reduce((sum, p) => sum + Number(p.quantity || p.qty || 0), 0);

                    lot.inwardTotal += part.inwardQty;
                    lot.iqcTotal += part.iqcQty;
                    lot.proTotal += part.proQty;
                    lot.ipqcTotal += part.ipqcQty;

                    lot.parts.push(part);
                });
            });

            return lots;
        }

        /* ── Update KPIs & Tables ── */
        function updateUI() {
            const currentSet = dataSets[activeTab];
            const query = searchInput.value.trim().toLowerCase();

            // Filter main entries by search
            const filteredMain = currentSet.main.filter(e =>
                !query ||
                (e.model && e.model.toLowerCase().includes(query)) ||
                (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                (e.partDescription && e.partDescription.toLowerCase().includes(query))
            );

            // Group filtered entries
            const grouped = groupEntries(filteredMain, currentSet.pro || [], currentSet.iqc || []);

            // Calculate KPIs
            const totalLots = grouped.length;
            
            let totalInward = 0;
            let totalIqc = 0;
            let totalPro = 0;
            let totalFinal = 0;
            let totalPartLines = 0;

            grouped.forEach(g => {
                totalInward += g.inwardTotal;
                totalIqc += g.iqcTotal;
                totalPro += g.proTotal;
                totalFinal += g.ipqcTotal;
                totalPartLines += g.parts.length;
            });

            // Update KPI Displays
            document.getElementById('kpiLots').textContent = totalLots;
            document.getElementById('kpiParts').textContent = totalPartLines;
            document.getElementById('kpiInwardQty').textContent = totalInward.toLocaleString('en-IN');
            document.getElementById('kpiIqcQty').textContent = totalIqc.toLocaleString('en-IN');
            document.getElementById('kpiProQty').textContent = totalPro.toLocaleString('en-IN');
            document.getElementById('kpiFinalQty').textContent = totalFinal.toLocaleString('en-IN');

            // Update Column headers with sum totals
            const inwardColHeader = document.getElementById('inwardColHeader');
            const iqcColHeader = document.getElementById('iqcColHeader');
            const proColHeader = document.getElementById('proColHeader');
            const ipqcColHeader = document.getElementById('ipqcColHeader');

            if (inwardColHeader) {
                inwardColHeader.innerHTML = `Total Inward<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalInward.toLocaleString('en-IN')}</small>`;
            }

            const labelSuffix = activeTab === 'accepted' ? 'Accepted' : 'Rejected';
            if (iqcColHeader) {
                iqcColHeader.innerHTML = `IQC ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalIqc.toLocaleString('en-IN')}</small>`;
            }
            if (proColHeader) {
                proColHeader.innerHTML = `Production ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalPro.toLocaleString('en-IN')}</small>`;
            }
            if (ipqcColHeader) {
                ipqcColHeader.innerHTML = `In-Process ${labelSuffix}<br><small style="font-size:0.65rem;color:var(--steel);font-weight:500;text-transform:none;">Total: ${totalFinal.toLocaleString('en-IN')}</small>`;
            }

            entryCount.textContent = totalLots;

            // Render Table
            if (totalLots === 0) {
                tableWrap.style.display = 'none';
                emptyState.style.display = 'flex';
                return;
            }

            tableWrap.style.display = 'block';
            emptyState.style.display = 'none';

            let html = '';
            grouped.forEach((g, i) => {
                html += `
                <tr class="group-row" style="cursor:pointer; transition: background 0.15s;"
                    onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'"
                    onclick="toggleSubRow('subrow-${i}')">
                    <td>${i + 1}</td>
                    <td><span class="cell-part">${formatDateDisplay(g.date)}</span></td>
                    <td><span class="cell-part">${g.model}</span></td>
                    <td style="text-align: right;"><strong>${g.inwardTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.iqcTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.proTotal.toLocaleString('en-IN')}</strong></td>
                    <td style="text-align: right;"><strong>${g.ipqcTotal.toLocaleString('en-IN')}</strong></td>
                    <td>${renderStatusCell(g)}</td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--steel); user-select:none;">&#9660; Details</span>
                    </td>
                </tr>
                <tr id="subrow-${i}" style="display: none; background: #fafbfc;">
                    <td colspan="11" style="padding: 0; border-bottom: 2px solid var(--fog);">
                        <div style="padding: 18px 30px;">
                            <table style="width:100%; border-collapse:collapse; font-size: 0.8rem;">
                                <thead>
                                    <tr>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Part No.</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Description</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:right; border-bottom:1px solid #e2e8f0;">Total Inward</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Reported Date</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Rep Serial No</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:left; border-bottom:1px solid #e2e8f0;">Addl Remarks</th>
                                        <th style="padding:8px 12px; font-weight:600; color:var(--navy); text-align:center; border-bottom:1px solid #e2e8f0;">History of Components</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${g.parts.map(p => `
                                        <tr>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">${p.partDescription}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 500;">
                                                ${p.inwardQty > 0 ? p.inwardQty.toLocaleString('en-IN') + '' : '—'}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="date" id="date-${p.partNo}" class="input-field" style="width: 120px; font-size: 0.75rem;" value="${p.reportedDate || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="text" id="serial-${p.partNo}" class="input-field" style="width: 120px; font-size: 0.75rem;" placeholder="Serial No" value="${p.repSerialNo || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                                                <input type="text" id="addl-${p.partNo}" class="input-field" style="width: 140px; font-size: 0.75rem;" placeholder="Addl Remarks" value="${p.additionalRemarks || ''}" />
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; vertical-align: top;">
                                                <button class="btn-outline-navy" style="padding:4px 8px; font-size:0.75rem;" onclick="viewHistory('${p.partNo}')">View History</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                `;
            });
            tableBody.innerHTML = html;
        }

        window.toggleSubRow = function(id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
        };

        searchInput.addEventListener('input', updateUI);

        /* ── CSV Export ── */
        document.getElementById('exportBtn').addEventListener('click', () => {
            const currentSet = dataSets[activeTab];
            const statusLabel = activeTab === 'accepted' ? 'Passed' : 'Rejected';

            const headers = [
                'Sl.No.', 
                'Date', 
                'Model', 
                'Part No.', 
                'Description', 
                'Total Inward',
                `IQC ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`, 
                `Production ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`, 
                `In-Process ${activeTab === 'accepted' ? 'Accepted' : 'Rejected'}`
            ];
            const rows = [headers];
            let sl = 1;

            const filteredMain = currentSet.main.filter(e => {
                const query = searchInput.value.trim().toLowerCase();
                return !query ||
                    (e.model && e.model.toLowerCase().includes(query)) ||
                    (e.partNo && e.partNo.toLowerCase().includes(query)) ||
                    (e.partDescription && e.partDescription.toLowerCase().includes(query));
            });

            const grouped = groupEntries(filteredMain, currentSet.pro || [], currentSet.iqc || []);

            grouped.forEach(g => {
                const d = g.date ? g.date.split('T')[0] : '';
                g.parts.forEach(p => {
                    rows.push([
                        sl++,
                        d,
                        g.model,
                        p.partNo,
                        p.partDescription,
                        p.inwardQty,
                        p.iqcQty,
                        p.proQty,
                        p.ipqcQty
                    ]);
                });
            });

            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = `first_pass_report_${activeTab}_` + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        });

        function renderStatusCell(g) {
            const statusClass = activeTab === 'accepted' ? 'accepted' : 'rejected';
            const statusLabel = activeTab === 'accepted' ? 'Passed' : 'Rejected';
            
            let html = `<span class="status-pill ${statusClass}">${statusLabel}</span>`;
            
            if (activeTab === 'rejected' && g.rejections && g.rejections.length > 0) {
                const allReinspected = g.rejections.every(r => r.reInwarded);
                const allSent = g.rejections.every(r => r.sentToReInward || r.reInwarded);
                
                if (allReinspected) {
                    html += ` <span style="font-size:0.68rem;color:var(--green);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(30,123,77,0.1);border-radius:4px;">[Re-inspected]</span>`;
                } else if (allSent) {
                    html += ` <span style="font-size:0.68rem;color:var(--amber);font-weight:600;display:inline-block;margin-left:8px;padding:3px 8px;background:rgba(199,123,18,0.1);border-radius:4px;">[In Completed]</span>`;
                } else {
                    const unsent = g.rejections.filter(r => !r.sentToReInward && !r.reInwarded);
                    const jsonStr = JSON.stringify(unsent).replace(/"/g, '&quot;');
                    html += ` <button onclick="event.stopPropagation(); sendLotToReInward('${jsonStr}', this)" style="margin-left:8px; padding: 4px 10px; font-size: 0.68rem; background: var(--navy); color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'Calibri', Calibri, sans-serif; font-weight: 600; transition: background 0.15s; outline: none;" onmouseover="this.style.background='#1A2B3C'" onmouseout="this.style.background='var(--navy)'">Send to Completed</button>`;
                }
            }
            return html;
        }

        function renderQtyCellPlain(qty) {
            if (qty <= 0) return '—';
            return `<strong>${qty.toLocaleString('en-IN')}</strong>`;
        }

        window.sendLotToReInward = async function(itemsJsonStr, btn) {
            try {
                let items = JSON.parse(itemsJsonStr);
                
                // Capture input values for each item
                items = items.map(item => {
                    const desc = document.getElementById('desc-' + item.partNo);
                    const serial = document.getElementById('serial-' + item.partNo);
                    const spare = document.getElementById('spare-' + item.partNo);
                    const reqqty = document.getElementById('reqqty-' + item.partNo);
                    const stage = document.getElementById('stage-' + item.partNo);
                    const date = document.getElementById('date-' + item.partNo);
                    
                    return {
                        ...item,
                        problemDescription: desc ? desc.value : '',
                        problemSerialNo: serial ? serial.value : '',
                        spareRequired: spare ? spare.value : '',
                        reqQty: reqqty ? reqqty.value : '',
                        problemStage: stage ? stage.value : '',
                        reportedDate: date ? date.value : ''
                    };
                });
                
                btn.disabled = true;
                btn.textContent = 'Sending...';
                const res = await fetch('/api/reinward/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                });
                if (res.ok) {
                    const toast = document.getElementById('saveToast');
                    if (toast) {
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                    fetchAllData();
                } else {
                    alert('Failed to send to Completed.');
                    btn.disabled = false;
                    btn.textContent = 'Send to Completed';
                }
            } catch (err) {
                console.error(err);
                alert('Error sending items to Completed.');
                btn.disabled = false;
                btn.textContent = 'Send to Completed';
            }
        };

        /* ── Init ── */
        fetchAllData();

    <datalist id="problemStageOptions">
        <option value="Production AE">
        <option value="Production BE">
        <option value="QA Failure">
        <option value="FQC Failure">
    </datalist>

    <!-- History Modal -->
    <div class="modal-overlay" id="historyModal">
        <div class="modal">
            <div class="modal-head">
                <h2>Component History</h2>
                <button class="close-modal" onclick="closeHistoryModal()">
                    <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                <div id="historyLoading" style="text-align: center; padding: 20px; color: var(--steel);">Loading history...</div>
                <div id="historyTimeline" style="display: none; position: relative; padding-left: 20px; margin-top: 10px;">
                    <!-- Timeline items injected here -->
                </div>
            </div>
        </div>
    </div>

    <style>
        .modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(13, 27, 42, 0.55);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .modal-overlay.show {
            display: flex;
        }
        .modal {
            background: white;
            border-radius: 12px;
            width: 100%;
            max-width: 480px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 32px 80px rgba(13, 27, 42, 0.2);
            display: flex;
            flex-direction: column;
        }
        .modal-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--fog);
        }
        .modal-head h2 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--navy);
        }
        .close-modal {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--steel);
        }
        .close-modal svg {
            width: 24px;
            height: 24px;
            stroke: currentColor;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .timeline-item {
            position: relative;
            padding-bottom: 20px;
        }
        .timeline-item:last-child {
            padding-bottom: 0;
        }
        .timeline-dot {
            position: absolute;
            left: -20px;
            top: 5px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--sapphire);
            border: 2px solid white;
            box-shadow: 0 0 0 2px var(--sapphire);
        }
        .timeline-line {
            position: absolute;
            left: -16px;
            top: 20px;
            bottom: -5px;
            width: 2px;
            background: var(--fog);
        }
        .timeline-item:last-child .timeline-line {
            display: none;
        }
        .timeline-content {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid var(--fog);
        }
        .timeline-date {
            font-size: 0.75rem;
            color: var(--steel);
            margin-bottom: 4px;
        }
        .timeline-stage {
            font-weight: 600;
            color: var(--navy);
            font-size: 0.9rem;
            margin-bottom: 4px;
        }
        .timeline-desc {
            font-size: 0.85rem;
            color: var(--text);
            margin: 0;
        }
    </style>

        window.viewHistory = function(partNo) {
            if (!partNo) {
                alert('No Part No found for this component.');
                return;
            }
            document.getElementById('historyModal').classList.add('show');
            document.getElementById('historyLoading').style.display = 'block';
            document.getElementById('historyTimeline').style.display = 'none';

            fetch('/api/history/' + encodeURIComponent(partNo))
                .then(res => res.json())
                .then(data => {
                    document.getElementById('historyLoading').style.display = 'none';
                    const timeline = document.getElementById('historyTimeline');
                    timeline.style.display = 'block';
                    
                    if (data.error || data.length === 0) {
                        timeline.innerHTML = '<p style="color:var(--steel); font-size:0.85rem;">No history available.</p>';
                        return;
                    }

                    let html = '';
                    data.forEach(item => {
                        let badgeColor = 'var(--steel)';
                        if (item.status.includes('Accepted') || item.status.includes('Moved') || item.status.includes('Inspected')) badgeColor = 'var(--green)';
                        if (item.status.includes('Rejected')) badgeColor = 'var(--red)';

                        html += `
                            <div class="timeline-item">
                                <div class="timeline-dot" style="background:${badgeColor}; box-shadow: 0 0 0 2px ${badgeColor};"></div>
                                <div class="timeline-line"></div>
                                <div class="timeline-content">
                                    <div class="timeline-date">${new Date(item.date).toLocaleString()}</div>
                                    <div class="timeline-stage">${item.stage} <span style="font-size:0.75rem; padding:2px 6px; border-radius:12px; background:rgba(0,0,0,0.05); color:${badgeColor}; border:1px solid ${badgeColor};">${item.status}</span></div>
                                    <p class="timeline-desc">${item.desc}</p>
                                    ${item.remarks ? `<p style="margin:4px 0 0 0; font-size:0.8rem; color:var(--amber);"><strong>Remarks:</strong> ${item.remarks}</p>` : ''}
                                </div>
                            </div>
                        `;
                    });
                    timeline.innerHTML = html;
                })
                .catch(err => {
                    console.error('Error fetching history:', err);
                    document.getElementById('historyLoading').innerHTML = 'Error loading history.';
                });
        };

        window.closeHistoryModal = function() {
            document.getElementById('historyModal').classList.remove('show');
        };
</body>

</html>


