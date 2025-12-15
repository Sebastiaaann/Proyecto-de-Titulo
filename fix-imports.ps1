# Script para actualizar imports a alias en componentes
Write-Host "🔄 Actualizando imports relativos a alias..." -ForegroundColor Cyan

$replacements = @(
    @{ File = "src/components/layout/Navbar.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/layout/Navbar.tsx"; Old = "from '../hooks/useTheme'"; New = "from '@hooks/useTheme'" },
    @{ File = "src/components/layout/Navbar.tsx"; Old = "from '../src/hooks/useAuth'"; New = "from '@hooks/useAuth'" },
    @{ File = "src/components/layout/Breadcrumbs.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/dashboard/Hero.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/dashboard/Dashboard.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/dashboard/Dashboard.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/dashboard/Dashboard.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/dashboard/Compliance.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/dashboard/Compliance.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/fleet/FleetManager.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/fleet/FleetManager.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/fleet/FleetManager.tsx"; Old = "from '../utils/errorMessages'"; New = "from '@utils/errorMessages'" },
    @{ File = "src/components/fleet/FleetManager.tsx"; Old = "from '../utils/validationRules'"; New = "from '@utils/validationRules'" },
    @{ File = "src/components/fleet/FleetTracking.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/fleet/FleetTracking.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/fleet/FleetMap.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/fleet/DriverMobile.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/fleet/DriverMobile.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/fleet/DriverMobile.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/routes/RoutePlanner.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/routes/RouteBuilder.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/routes/RouteBuilder.tsx"; Old = "from '../utils/errorMessages'"; New = "from '@utils/errorMessages'" },
    @{ File = "src/components/routes/RouteBuilder.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/routes/RouteBuilder.tsx"; Old = "from '../services/databaseService'"; New = "from '@services/databaseService'" },
    @{ File = "src/components/routes/AIQuote.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/routes/AIQuote.tsx"; Old = "from '../utils/errorMessages'"; New = "from '@utils/errorMessages'" },
    @{ File = "src/components/financials/Financials.tsx"; Old = "from '../store/useStore'"; New = "from '@store/useStore'" },
    @{ File = "src/components/financials/Financials.tsx"; Old = "from '../services/geminiService'"; New = "from '@services/geminiService'" },
    @{ File = "src/components/auth/LoginForm.tsx"; Old = "from '../Toast'"; New = "from '@components/common/Toast'" },
    @{ File = "src/components/auth/LoginForm.secure.tsx"; Old = "from '../Toast'"; New = "from '@components/common/Toast'" },
    @{ File = "src/components/auth/AuthDiagnostic.tsx"; Old = "from '../src/lib/supabase'"; New = "from '@services/supabaseClient'" },
    @{ File = "src/components/auth/ProtectedRoute.tsx"; Old = "from '../../../src/types/auth.types'"; New = "from '@types/auth.types'" }
)

$count = 0
foreach ($r in $replacements) {
    $filePath = $r.File
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        if ($content -match [regex]::Escape($r.Old)) {
            $content = $content -replace [regex]::Escape($r.Old), $r.New
            Set-Content -Path $filePath -Value $content -NoNewline
            $count++
            Write-Host "  ✓ $filePath" -ForegroundColor Green
        }
    }
}

Write-Host "`n✅ $count archivos actualizados" -ForegroundColor Green
