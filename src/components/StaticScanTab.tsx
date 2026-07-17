import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Play,
  FileText,
  Filter,
  Folder,
  Search,
  Code,
  Flame,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  ExternalLink
} from "lucide-react";
import { Finding, ScanResult } from "../../server/services/scanner.service";

const RULE_TRANSLATIONS: Record<string, Record<string, { name: string; description: string; remediation: string }>> = {
  en: {
    "SAST-001": {
      name: "Hardcoded Sensitive Information / AWS Access Key",
      description: "Detected hardcoded AWS Access Key identifier in the application source code. This allows attackers to directly access your enterprise's AWS cloud infrastructure.",
      remediation: "Remove the Access Key from the source code. Use centralized configuration management or AWS STS to fetch temporary credentials with an expiration."
    },
    "SAST-002": {
      name: "Hardcoded Sensitive Information / Stripe API Key",
      description: "Detected Stripe Secret Live Key directly in the source code. Attackers could extract this key to perform fraudulent transactions, issue refunds, or steal customers' card details.",
      remediation: "Remove the secret key from the client-side immediately. All payment tasks must be processed through a secure backend server with authentication."
    },
    "SAST-003": {
      name: "Hardcoded Common Password or API Key",
      description: "Detected variables likely holding sensitive strings such as api_key, secret_key, access_token, or db_password assigned directly with a hardcoded constant string.",
      remediation: "Utilize Android Keystore, EncryptedSharedPreferences, or load secure configuration parameters dynamically over HTTPS from a verified API server."
    },
    "SAST-004": {
      name: "Use of Insecure ECB Encryption Mode",
      description: "ECB (Electronic Codebook) mode encrypts identical plaintext blocks into identical ciphertext blocks. This allows attackers to detect repetitive patterns in ciphertext to deduce and reconstruct the plaintext without knowing the key.",
      remediation: "Switch the encryption cipher mode to more secure options that use a random Initialization Vector (IV), such as AES/CBC/PKCS5Padding or AES/GCM/NoPadding."
    },
    "SAST-005": {
      name: "Insecure Hash Algorithm (MD5)",
      description: "MD5 is an obsolete cryptographic hash algorithm proven vulnerable to collision attacks. MD5 hashes can be cracked extremely fast using precomputed rainbow tables.",
      remediation: "Upgrade the hash algorithm to SHA-256 or SHA-512 to ensure robust data integrity."
    },
    "SAST-006": {
      name: "Insecure Hash Algorithm (SHA-1)",
      description: "SHA-1 is no longer considered secure against low-cost collision attacks. Using SHA-1 for digital signatures or sensitive hashing carries high forgery risks.",
      remediation: "Replace it with the stronger SHA-256 algorithm."
    },
    "SAST-007": {
      name: "JavaScript Enabled in WebView",
      description: "Enabling JavaScript in WebView introduces Cross-Site Scripting (XSS) risks. If the WebView loads untrusted third-party URLs or suffers HTML injection, malicious script execution can compromise local device resources.",
      remediation: "Only enable JavaScript if strictly necessary. Validate and sanitize loaded URLs using a strict hostname whitelist."
    },
    "SAST-008": {
      name: "WebView Allowed File Access",
      description: "Setting setAllowFileAccess(true) allows a WebView to read local files in the app's private directories (such as SQLite databases or SharedPreferences configs) under an XSS context.",
      remediation: "Explicitly disable file access by calling setAllowFileAccess(false). Since Android 11, this option is disabled by default."
    },
    "SAST-009": {
      name: "WebView Universal Access from File URLs Allowed",
      description: "The setAllowUniversalAccessFromFileURLs configuration allows JavaScript running inside 'file://' contexts to make cross-origin requests to read any local files on the filesystem.",
      remediation: "Change this configuration to false to prevent potential data leakage via local file URLs."
    },
    "SAST-010": {
      name: "SSL Certification Bypass (Empty TrustManager)",
      description: "Overriding checkServerTrusted or checkClientTrusted with empty methods accepts all forged, expired, or self-signed SSL certificates, leaving the app open to Man-In-The-Middle (MITM) eavesdropping attacks.",
      remediation: "Ensure rigorous, proper SSL validation chains or utilize Android's built-in Network Security Configuration."
    },
    "SAST-011": {
      name: "Insecure Hostname Verifier (Accepts All)",
      description: "The verify() function in HostnameVerifier unconditionally returns true. This disables SSL/TLS hostname domain validation, allowing MITM actors to impersonate the target server.",
      remediation: "Verify that the remote hostname precisely matches the domain registered in the official digital certificate."
    },
    "SAST-012": {
      name: "Exposed Vulnerable Android Exported Component",
      description: "Android components (Activity, Service, Receiver) configured with exported='true' without custom permission protection can be invoked directly by any malicious app on the device to hijack state or leak data.",
      remediation: "Set android:exported='false' if the component does not need to communicate with other apps. Otherwise, secure it with a custom permission set to signature protection."
    },
    "SAST-013": {
      name: "SQL Injection Hazard via Concatenation",
      description: "SQL queries constructed via string concatenation instead of parameterized placeholders are highly susceptible to SQL Injection. SQLite database contents can be modified or leaked.",
      remediation: "Use question marks (?) as dynamic parameter placeholders and provide raw arguments separately: db.rawQuery('SELECT * FROM users WHERE username = ?', new String[]{username});"
    },
    "SAST-014": {
      name: "OS Command Execution Found (Runtime.exec)",
      description: "The application uses Runtime.exec() to spawn shell commands. Unsanitized input values passed to shell environments open up critical OS Command Injection vulnerabilities.",
      remediation: "Refrain from executing OS commands. If unavoidable, utilize ProcessBuilder and strictly filter and validate arguments using a whitelist."
    },
    "SAST-015": {
      name: "Sensitive Debug Log Exposure in Release",
      description: "Logging via Log.d or Log.v prints to system-wide Logcat. Attackers with physical access or USB debugging enabled can monitor sensitive parameters (tokens, keys, user data) in real-time.",
      remediation: "Rely on Proguard/R8 optimization rules to automatically strip Log.d and Log.v statements entirely during production release packaging."
    },
    "SAST-016": {
      name: "Unencrypted Network Traffic Allowed (HTTP Cleartext)",
      description: "The application profile permits cleartext (unencrypted) HTTP network traffic. Communication over unsecured networks can be trivially sniffed or modified via MITM attacks.",
      remediation: "Declare android:usesCleartextTraffic='false' in your AndroidManifest to enforce secure HTTPS channels across all endpoints."
    },
    "SAST-017": {
      name: "Debuggable Application Flag Active",
      description: "Setting android:debuggable='true' allows anyone to attach debuggers (jdb, Android Studio, Frida) directly to the active process to trace memory, call functions, and modify instruction flows.",
      remediation: "Ensure you delete the android:debuggable attribute or set it to 'false' in production before exporting the APK for release."
    },
    "SAST-018": {
      name: "Exposed Public Firebase DB URL",
      description: "Detected Firebase Realtime Database URL hardcoded in configurations or source code. If the database Security Rules are open, anyone can read/write data arbitrarily over the Internet.",
      remediation: "Strengthen Security Rules on the Firebase Console to enforce authentication and block unauthenticated public requests."
    }
  },
  ja: {
    "SAST-001": {
      name: "機密情報の露出 / AWSアクセスキー",
      description: "アプリケーションのソースコード内にハードコードされたAWSアクセスキーの識別子が検出されました。これにより、攻撃者が企業のAWSクラウドインフラストラクチャに直接アクセスできるようになります。",
      remediation: "ソースコードからアクセスキーを削除してください。中央集中型の構成管理ソリューションまたはAWS STSを使用して、有効期限付きの一時的な認証情報を取得します。"
    },
    "SAST-002": {
      name: "機密情報の露出 / Stripe APIキー",
      description: "ソースコード内にStripeのシークレットライブキーが直接検出されました。攻撃者はこのキーを抽出して、不正な取引や返金を実行したり、顧客のカード詳細を盗み出したりする可能性があります。",
      remediation: "クライアント側からただちにシークレットキーを削除してください。すべての決済処理は、認証機能を備えた安全なバックエンドサーバー経由で処理される必要があります。"
    },
    "SAST-003": {
      name: "パスワードまたは一般APIキーの露出",
      description: "api_key、secret_key、access_token、またはdb_passwordなどの機密データを含んでいる可能性が高い変数に、ハードコードされた定数文字列が直接代入されているのが検出されました。",
      remediation: "Android KeystoreやEncryptedSharedPreferencesを利用するか、検証済みのAPIサーバーからHTTPS経由で機密構成パラメータを動的にロードしてください。"
    },
    "SAST-004": {
      name: "安全でないECB暗号化モードの使用",
      description: "ECB（電子コードブック）モードは、同一 of 平文ブロックを同一の暗号文ブロックに暗号化します。これにより、攻撃者はキーを知らなくても、暗号文の反復パターンを検出して平文を推測し、再構築することができます。",
      remediation: "ランダム初期化ベクトル（IV）を使用する、より安全なAES/CBC/PKCS5PaddingまたはAES/GCM/NoPaddingなどの暗号化モードに切り替えてください。"
    },
    "SAST-005": {
      name: "脆弱なハッシュアルゴリズム（MD5）",
      description: "MD5は衝突攻撃に対して脆弱であることが証明されている、時代遅れのハッシュアルゴリズムです。MD5ハッシュはレインボーテーブルを使用して非常に高速にクラックされる可能性があります。",
      remediation: "データの整合性を確実にするために、ハッシュアルゴリズムをSHA-256またはSHA-512にアップグレードしてください。"
    },
    "SAST-006": {
      name: "脆弱なハッシュアルゴリズム（SHA-1）",
      description: "SHA-1は、低コストの衝突攻撃に対して安全であるとは見なされなくなりました。デジタル署名や機密性の高いハッシュにSHA-1を使用することは、偽造のリスクが高くなります。",
      remediation: "より強力なSHA-256アルゴリズムに置き換えてください。"
    },
    "SAST-007": {
      name: "WebViewでのJavaScriptの有効化",
      description: "WebViewでJavaScriptを有効にすると、クロスサイトスクリプティング（XSS）のリスクが発生します。信頼できないサードパーティのURLをロードしたり、HTMLインジェクションを受けたりした場合、悪意のあるスクリプトがローカルデバイスのリソースを侵害する可能性があります。",
      remediation: "厳密に必要な場合のみJavaScriptを有効にしてください。厳格なホスト名ホワイトリストを使用して、読み込まれるURLを検証・フィルタリングします。"
    },
    "SAST-008": {
      name: "WebViewでのローカルファイルアクセスの許可",
      description: "setAllowFileAccess(true)を設定すると、XSS攻撃を受けた際、WebViewがアプリのプライベートディレクトリ内のローカルファイル（SQLiteデータベースや環境設定ファイルなど）を読み取ることが可能になります。",
      remediation: "setAllowFileAccess(false)を呼び出して、明示的にファイルアクセスを無効にしてください。Android 11以降、このオプションはデフォルトで無効になっています。"
    },
    "SAST-009": {
      name: "WebViewでのファイルURLからのユニバーサルアクセスの許可",
      description: "setAllowUniversalAccessFromFileURLsの設定を有効にすると、'file://'コンテキスト内で実行されるJavaScriptが、ファイルシステム上の任意のローカルファイルを読み取るためのクロスオリジン要求を実行できるようになります。",
      remediation: "ローカルファイルURLを介した潜在的なデータ漏洩を防ぐため、この設定をfalseに変更してください。"
    },
    "SAST-010": {
      name: "SSL証明書検証のバイパス（空のTrustManager）",
      description: "checkServerTrustedまたはcheckClientTrustedを空のメソッドでオーバーライドすると、偽造、期限切れ、または自己署名のSSL証明書がすべて受け入れられ、アプリが中間者（MITM）盗聴攻撃に対して脆弱になります。",
      remediation: "厳格で適切なSSL検証チェーンを構築するか、Androidに組み込まれている「ネットワークセキュリティ構成」を使用してください。"
    },
    "SAST-011": {
      name: "不適切なホスト名検証（すべて許可）",
      description: "HostnameVerifierのverify()関数が無条件にtrueを返しています。これにより、SSL/TLSホスト名ドメイン検証が無効になり、中間者攻撃者がターゲットサーバーを偽装できるようになります。",
      remediation: "リモートホスト名が公式のデジタル証明書に登録されているドメインと正確に一致することを確認してください。"
    },
    "SAST-012": {
      name: "脆弱なエクスポートされたAndroidコンポーネントの露出",
      description: "exported='true'が設定され、カスタムパーミッションで保護されていないAndroidコンポーネント（Activity、Service、Receiver）は、同じデバイス上のあらゆる悪意のあるアプリから直接呼び出され、状態の乗っ取りやデータ漏洩を引き起こす可能性があります。",
      remediation: "他のアプリと通信する必要がないコンポーネントの場合は、android:exported='false'に設定してください。それ以外の場合は、署名保護レベルのカスタムパーミッションで保護します。"
    },
    "SAST-013": {
      name: "文字列結合によるSQLインジェクションのリスク",
      description: "パラメータ化されたプレースホルダーの代わりに文字列の結合によって構築されたSQLクエリは、SQLインジェクションに対して非常に脆弱です。ローカルのSQLiteデータベースの内容が書き換えられたり、データが漏洩したりする可能性があります。",
      remediation: "動的パラメータプレースホルダー（?）を使用し、引数を配列として個別に指定してください：db.rawQuery('SELECT * FROM users WHERE username = ?', new String[]{username});"
    },
    "SAST-014": {
      name: "OSコマンドの直接実行（Runtime.exec）の検出",
      description: "アプリケーションがシェルコマンドを生成するためにRuntime.exec()を使用しています。シェル環境に渡される入力値がサニタイズされていない場合、重大なOSコマンドインジェクションの脆弱性が発生します。",
      remediation: "OSコマンドの実行は避けてください。どうしても避けられない場合は、ProcessBuilderを使用し、ホワイトリストを用いて引数を厳密にフィルタリングおよび検証してください。"
    },
    "SAST-015": {
      name: "リリースビルドでのデバッグログ出力の露出",
      description: "Log.dまたはLog.vを介したログ記録は、システム全体のLogcatに出力されます。物理的なアクセスを持つ、またはUSBデバッグを有効にしている攻撃者が、機密データ（トークン、キー、個人情報など）をリアルタイムで監視する可能性があります。",
      remediation: "本番用のリリースビルドをパッケージングする際に、ProguardまたはR8の最適化ルールを利用してLog.dおよびLog.vステートメントを自動的に完全に削除してください。"
    },
    "SAST-016": {
      name: "暗号化されていないネットワークトラフィックの許可（HTTP Cleartext）",
      description: "アプリケーションの設定で、暗号化されていないHTTPネットワークトラフィックが許可されています。安全でないネットワーク上での通信は、中間者攻撃を介して簡単に傍受または改ざんされる可能性があります。",
      remediation: "AndroidManifestにandroid:usesCleartextTraffic='false'を宣言し、すべてのエンドポイントに対して安全なHTTPS接続を強制してください。"
    },
    "SAST-017": {
      name: "アプリケーションデバッグフラグの有効化",
      description: "android:debuggable='true'を設定すると、アクティブなプロセスにデバッガー（jdb, Android Studio, Fridaなど）を直接アタッチして、メモリのトレース、関数の呼び出し、命令フローの変更が誰でも可能になります。",
      remediation: "本番環境にリリースする前に、AndroidManifestからandroid:debuggable属性を削除するか、'false'に設定してください。"
    },
    "SAST-018": {
      name: "公開Firebase DB URLの露出",
      description: "構成ファイルまたはソースコードに、Firebase Realtime Database의 URLが直接検出されました。データベースのセキュリティルール（Security Rules）が適切に保護されていない場合、誰でもインターネット経由でデータを読み書きできてしまいます。",
      remediation: "Firebaseコンソールでセキュリティルール（Security Rules）を設定し、認証のない匿名の公開要求を拒否するようにしてください。"
    }
  }
};

interface StaticScanTabProps {
  simulationMode: boolean;
  language: string;
  t: any;
}

export default function StaticScanTab({ simulationMode, language, t }: StaticScanTabProps) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [customWorkspace, setCustomWorkspace] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Filtering and Searching
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Expanded findings map
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>({});

  const toggleExpand = (idx: number) => {
    setExpandedFindings(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    setScanResult(null);
    setExpandedFindings({});

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceDir: customWorkspace.trim() || undefined,
          simulation: simulationMode
        })
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          setScanResult(data);
        } else {
          setErrorMessage(data.error || "Có lỗi xảy ra trong quá trình phân tích tĩnh.");
        }
      } else {
        setErrorMessage("Không nhận được phản hồi hợp lệ từ máy chủ quét.");
      }
    } catch (err: any) {
      setErrorMessage("Không thể kết nối tới máy chủ phân tích. Hãy kiểm tra xem server local có đang chạy.");
    } finally {
      setIsScanning(false);
    }
  };

  const getCategoryTranslation = (category: string) => {
    switch (category) {
      case "Hardcoded Secrets":
        return t.sastCatHardcodedSecrets || category;
      case "Weak Cryptography":
        return t.sastCatWeakCryptography || category;
      case "WebView Risk":
        return t.sastCatWebViewRisk || category;
      case "SSL Pinning / Network":
        return t.sastCatSslPinning || category;
      case "Exported Components":
        return t.sastCatExportedComponents || category;
      case "SQL Injection":
        return t.sastCatSqlInjection || category;
      case "Command Execution":
        return t.sastCatCommandExecution || category;
      case "Debug Log exposure":
        return t.sastCatDebugLog || category;
      default:
        return category;
    }
  };

  const getTranslatedError = (error: string | null): string | null => {
    if (!error) return null;
    const errLower = error.toLowerCase();
    const contains = (sub: string) => errLower.includes(sub.toLowerCase());

    if (language === "vi") {
      return error;
    }

    if (language === "ja") {
      if (contains("không tìm thấy bất kỳ thư mục") || contains("decompile apk trước")) {
        return "システム内に逆コンパイルされたワークスペースフォルダが見つかりませんでした。セキュリティスキャンを実行する前に、まずAPKを逆コンパイルしてください。";
      }
      if (contains("không nhận được phản hồi") || contains("phản hồi hợp lệ")) {
        return "スキャンサーバーから有効な応答を受信できませんでした。";
      }
      if (contains("không thể kết nối") || contains("server local")) {
        return "分析サーバーに接続できません。ローカルサーバーが実行されているか確認してください。";
      }
      if (contains("có lỗi xảy ra") || contains("lỗi khi chạy quét") || contains("phân tích tĩnh")) {
        return "静的解析処理中にエラーが発生しました。";
      }
      return error;
    }

    // Default to English
    if (contains("không tìm thấy bất kỳ thư mục") || contains("decompile apk trước")) {
      return "No decompiled workspace directories found in the system. Please decompile an APK first before running the security scan.";
    }
    if (contains("không nhận được phản hồi") || contains("phản hồi hợp lệ")) {
      return "Did not receive a valid response from the scan server.";
    }
    if (contains("không thể kết nối") || contains("server local")) {
      return "Cannot connect to the analysis server. Please check if the local server is running.";
    }
    if (contains("có lỗi xảy ra") || contains("lỗi khi chạy quét") || contains("phân tích tĩnh")) {
      return "An error occurred during the static analysis process.";
    }
    return error;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", scoreImpact: 15 };
      case "HIGH":
        return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25", scoreImpact: 10 };
      case "MEDIUM":
        return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", scoreImpact: 5 };
      case "LOW":
        return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", scoreImpact: 2 };
      default:
        return { text: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/25", scoreImpact: 0 };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/35";
    if (score >= 55) return "text-yellow-400 border-yellow-500/35";
    return "text-red-400 border-red-500/35";
  };

  const categories = ["ALL", "Hardcoded Secrets", "Weak Cryptography", "WebView Risk", "SSL Pinning / Network", "Exported Components", "SQL Injection", "Command Execution", "Debug Log exposure"];
  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  // Filter & Search Logic
  // Translate finding name, description, remediation
  const getTranslatedFinding = (f: Finding): Finding => {
    const translations = RULE_TRANSLATIONS[language];
    if (translations && translations[f.ruleId]) {
      return {
        ...f,
        ruleName: translations[f.ruleId].name,
        description: translations[f.ruleId].description,
        remediation: translations[f.ruleId].remediation
      };
    }
    return f;
  };

  // Translate summary dynamically
  const getTranslatedSummary = (res: ScanResult): string => {
    if (language === "vi") return res.summary;

    const filesCount = res.totalFilesScanned;
    const totalFindings = res.findings.length;
    
    if (totalFindings === 0) {
      if (language === "ja") {
        return `静的スキャンが正常に完了しました！システムは重要なぜい弱性を見つけることなく、${filesCount}個のソースファイルと設定ファイルを詳細に分析しました。おめでとうございます、あなたのアプリは非常に安全です！`;
      }
      return `Static scan completed successfully! The system analyzed ${filesCount} source files and configurations without finding any critical vulnerabilities. Congratulations, your app is highly secure!`;
    }

    const crits = res.findings.filter((f) => f.severity === "CRITICAL").length;
    const highs = res.findings.filter((f) => f.severity === "HIGH").length;
    const meds = res.findings.filter((f) => f.severity === "MEDIUM").length;
    const lows = res.findings.filter((f) => f.severity === "LOW").length;

    let summaryText = "";
    if (language === "ja") {
      summaryText = `分析された${filesCount}個のファイル全体で、合計${totalFindings}件 of セキュリティ上の問題が検出されました。内訳：重大 (Critical) ${crits}件、高 (High) ${highs}件、中 (Medium) ${meds}件、低 (Low) ${lows}件。`;
      if (res.score < 40) {
        summaryText += "このアプリケーションは極めて深刻なリスクを抱えています。リリース前に、ハードコードされたAPIキーを削除し、WebViewの脆弱性をただちに修正する必要があります！";
      } else if (res.score < 75) {
        summaryText += "中程度のリスクレベルです。ストレージファイルの暗号化と、ネットワークセキュリティ構成の再設定を推奨します。";
      } else {
        summaryText += "アプリケーションは比較的安全ですが、最適な保護のためにデバッグログ出力メカニズムとビルド設定の微調整が必要です。";
      }
    } else {
      summaryText = `Detected a total of ${totalFindings} security issues across ${filesCount} analyzed files. Includes: ${crits} Critical, ${highs} High, ${meds} Medium, and ${lows} Low. `;
      if (res.score < 40) {
        summaryText += "This application poses an extremely severe risk. Hardcoded API keys must be removed and WebView vulnerabilities patched immediately before release!";
      } else if (res.score < 75) {
        summaryText += "Moderate risk level. It is recommended to encrypt storage files and reconfigure the Network Security Configuration.";
      } else {
        summaryText += "The application is relatively secure but needs fine-tuning of debug logging mechanisms and build configuration for optimal protection.";
      }
    }
    return summaryText;
  };

  // Fully translated scan result for display and exports
  const translatedScanResult: ScanResult | null = scanResult ? {
    ...scanResult,
    summary: getTranslatedSummary(scanResult),
    findings: scanResult.findings.map(getTranslatedFinding)
  } : null;

  const filteredFindings = translatedScanResult?.findings.filter(f => {
    const matchesCategory = filterCategory === "ALL" || f.category === filterCategory;
    const matchesSeverity = filterSeverity === "ALL" || f.severity === filterSeverity;
    const matchesSearch = searchQuery === "" || 
      f.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.codeLine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  }) || [];

  // Export handlers
  const handleExportMarkdown = () => {
    if (!translatedScanResult) return;

    const scanModeStr = simulationMode ? t.sastReportModeSim : t.sastReportModeReal;
    let md = `# ${t.sastReportTitle}\n`;
    md += `*${t.sastReportTime} ${new Date().toLocaleString(language === "vi" ? "vi-VN" : language === "ja" ? "ja-JP" : "en-US")}*\n`;
    md += `*${t.sastReportMode} ${scanModeStr}*\n`;
    md += `*${t.sastReportWorkspace} \`${translatedScanResult.workspaceDir}\`*\n`;
    md += `*${t.sastReportScore} **${translatedScanResult.score}/100***\n\n`;
    
    md += `## ${t.sastReportSummary}\n`;
    md += `${translatedScanResult.summary}\n\n`;
    
    md += `## ${t.sastReportStats}\n`;
    md += `- **${t.sastReportFilesScannedStat}** ${translatedScanResult.totalFilesScanned}\n`;
    md += `- **${t.sastReportVulnerabilitiesStat}** ${translatedScanResult.findings.length}\n\n`;

    md += `## ${t.sastReportDetails} (${filteredFindings.length})\n\n`;

    if (filteredFindings.length > 0) {
      filteredFindings.forEach((finding, idx) => {
        md += `### ${idx + 1}. [${finding.severity}] ${finding.ruleName}\n`;
        md += `- **${t.sastReportClassification}** ${finding.category}\n`;
        md += `- **${t.sastReportFilePath}** \`${finding.file}\` (Line ${finding.line})\n\n`;
        md += `#### ${t.sastReportCodeSnippet}\n\`\`\`java\n${finding.codeLine}\n\`\`\`\n\n`;
        md += `#### ${t.sastReportDetailDesc}\n${finding.description}\n\n`;
        md += `#### ${t.sastReportGuideRemediation}\n${finding.remediation}\n\n`;
        md += `---\n\n`;
      });
    } else {
      md += `🎉 ${t.sastReportEmptyFindings}\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_SAST_AndroSentry_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    if (!translatedScanResult) return;

    let findingsHtml = "";
    if (filteredFindings.length > 0) {
      filteredFindings.forEach((finding, idx) => {
        let severityColor = "#9ca3af";
        if (finding.severity === "CRITICAL") severityColor = "#ef4444";
        else if (finding.severity === "HIGH") severityColor = "#f97316";
        else if (finding.severity === "MEDIUM") severityColor = "#eab308";
        else if (finding.severity === "LOW") severityColor = "#3b82f6";

        findingsHtml += `
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title">${idx + 1}. ${finding.ruleName}</span>
            <span class="severity-badge" style="background: ${severityColor}20; color: ${severityColor}; border: 1px solid ${severityColor}40;">${finding.severity}</span>
          </div>
          <div class="finding-meta">
            <strong>${t.sastReportClassification}</strong> ${finding.category} | <strong>${t.sastReportFilePath}</strong> <code>${finding.file}</code> (Line ${finding.line})
          </div>
          <p class="finding-desc"><strong>${t.sastReportDetailDesc}</strong> ${finding.description}</p>
          <div class="finding-code">
            <pre><code>${finding.codeLine.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
          </div>
          <div class="remediation-block">
            <strong>${t.sastReportGuideRemediation}</strong>
            <p>${finding.remediation.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
        </div>
        `;
      });
    } else {
      findingsHtml = `<p style="text-align:center; color:#8b949e; padding: 40px 0;">🎉 ${t.sastReportEmptyFindings}</p>`;
    }

    const scoreCol = translatedScanResult.score >= 80 ? '#10b981' : translatedScanResult.score >= 55 ? '#f59e0b' : '#ef4444';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.sastReportTitle}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0d1117;
          color: #c9d1d9;
          margin: 0;
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        h1 {
          color: #ef4444;
          font-size: 26px;
          border-bottom: 2px solid #30363d;
          padding-bottom: 12px;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .meta-info {
          font-size: 13px;
          color: #8b949e;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #21262d;
          padding-bottom: 15px;
        }
        .score-badge {
          background: ${scoreCol}20;
          color: ${scoreCol};
          font-weight: bold;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid ${scoreCol}40;
          font-size: 15px;
        }
        .summary-box {
          background: #1f242c;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .summary-box h2 {
          font-size: 18px;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: #0d1117;
          border: 1px solid #21262d;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-val {
          font-size: 24px;
          font-weight: bold;
          color: #58a6ff;
        }
        .finding-card {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .finding-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          gap: 15px;
        }
        .finding-title {
          font-weight: bold;
          font-size: 17px;
          color: #ffffff;
        }
        .severity-badge {
          font-size: 11px;
          font-family: monospace;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .finding-meta {
          font-size: 12px;
          color: #8b949e;
          margin-bottom: 12px;
        }
        .finding-desc {
          font-size: 14px;
          margin-bottom: 12px;
          color: #c9d1d9;
        }
        .finding-code {
          background: #161b22;
          padding: 10px 15px;
          border-radius: 6px;
          border: 1px solid #30363d;
          margin-bottom: 15px;
          overflow-x: auto;
        }
        pre {
          margin: 0;
        }
        code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12.5px;
          color: #ff7b72;
        }
        .remediation-block {
          background: #161b22;
          border-left: 3px solid #58a6ff;
          border-radius: 0 4px 4px 0;
          padding: 12px 15px;
          font-size: 13.5px;
        }
        .remediation-block strong {
          color: #58a6ff;
          text-transform: uppercase;
          display: block;
          margin-bottom: 5px;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #8b949e;
          margin-top: 40px;
          border-top: 1px solid #21262d;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 ${t.sastReportTitle}</h1>
        <div class="meta-info">
          <span>${t.sastReportTime} ${new Date().toLocaleString(language === "vi" ? "vi-VN" : language === "ja" ? "ja-JP" : "en-US")}</span>
          <div>
            <span>${t.sastReportWorkspace} <code>${translatedScanResult.workspaceDir}</code> | ${t.sastReportScore} </span>
            <span class="score-badge">${translatedScanResult.score}/100</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-val">${translatedScanResult.totalFilesScanned}</div>
            <div style="font-size: 12px; color: #8b949e; margin-top: 5px;">${t.sastReportFilesScannedStat}</div>
          </div>
          <div class="stat-card">
            <div class="stat-val" style="color: #ff7b72;">${translatedScanResult.findings.length}</div>
            <div style="font-size: 12px; color: #8b949e; margin-top: 5px;">${t.sastReportVulnerabilitiesStat}</div>
          </div>
        </div>

        <div class="summary-box">
          <h2>${t.sastReportSummary}</h2>
          <p style="margin: 0; font-size: 14px; color: #c9d1d9;">${translatedScanResult.summary}</p>
        </div>

        <h3 style="color: #ffffff; border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 20px;">${t.sastReportDetails} (${filteredFindings.length})</h3>
        ${findingsHtml}

        <div class="footer">
          ${t.sastReportFooter}
        </div>
      </div>
    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_SAST_AndroSentry_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="static-scan-container">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-5" id="sast-sidebar">
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5" id="sast-config-card">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#21262d]" id="sast-config-header">
            <Flame className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-white">
              {t.sastTitle}
            </h3>
          </div>
          
          <p className="text-xs text-[#8b949e] mb-4 leading-relaxed">
            {t.sastDesc}
          </p>

          <div className="flex flex-col gap-4" id="sast-inputs">
            <div className="flex flex-col gap-1.5" id="sast-input-workspace">
              <label className="text-xs text-[#8b949e] font-mono flex items-center gap-1">
                <Folder className="w-3 h-3 text-accent" />
                {t.sastWorkspaceLabel}
              </label>
              <input
                type="text"
                value={customWorkspace}
                onChange={(e) => setCustomWorkspace(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-colors"
                placeholder="e.g. decompiled_src"
              />
              <span className="text-[10px] text-txt-muted leading-relaxed">
                {t.sastWorkspaceSub}
              </span>
            </div>

            <button
              id="sast-scan-trigger-btn"
              onClick={handleRunScan}
              disabled={isScanning}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer ${
                isScanning
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/10 hover:shadow-red-900/20"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              <span>
                {isScanning ? t.sastScanningState : t.sastBtnRun}
              </span>
            </button>
          </div>
        </div>

        {/* Scan Info Widget */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-5 text-xs text-[#8b949e] flex flex-col gap-2.5" id="sast-info-widget">
          <div className="flex items-center gap-2 text-white font-semibold mb-1">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{t.sastRulesHeader}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{getCategoryTranslation("Hardcoded Secrets")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>{getCategoryTranslation("Weak Cryptography")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span>{getCategoryTranslation("WebView Risk")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>{getCategoryTranslation("SSL Pinning / Network")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{getCategoryTranslation("Exported Components")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              <span>{getCategoryTranslation("SQL Injection")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>{getCategoryTranslation("Command Execution")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>{getCategoryTranslation("Debug Log exposure")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Board */}
      <div className="lg:col-span-8 flex flex-col gap-6" id="sast-results-board">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3 text-sm text-red-400" id="sast-error-banner">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold mb-1">{t.sastErrorTitle}</strong>
              <p className="leading-relaxed">{getTranslatedError(errorMessage)}</p>
              <p className="mt-2 text-xs text-[#8b949e]">
                {t.sastErrorSub}
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 flex flex-col items-center justify-center text-center" id="sast-loading-card">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/10 border-t-red-500 animate-spin"></div>
              <FileCode className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {t.sastLoadingTitle}
            </h4>
            <p className="text-xs text-[#8b949e] max-w-md leading-relaxed">
              {t.sastLoadingDesc}
            </p>
          </div>
        )}

        {!isScanning && !translatedScanResult && !errorMessage && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-12 text-center" id="sast-empty-card">
            <ShieldCheck className="w-12 h-12 text-[#8b949e] mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-bold text-white mb-2">
              {t.sastEmptyTitle}
            </h4>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto leading-relaxed mb-6">
              {t.sastEmptyDesc}
            </p>
          </div>
        )}

        {/* Scan Results Content */}
        {!isScanning && translatedScanResult && (
          <div className="flex flex-col gap-6 animate-fade-in" id="sast-results-content">
            {/* Summary Widget Panel */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6" id="sast-summary-card">
              {/* Circular Gauge */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <div 
                  className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${getScoreColor(translatedScanResult.score)}`}
                  id="sast-score-gauge"
                >
                  <span className="text-3xl font-extrabold tracking-tight">{translatedScanResult.score}</span>
                  <span className="text-[10px] uppercase font-bold text-[#8b949e]">{t.sastScoreLabel}</span>
                </div>
              </div>

              {/* Textual summary */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-base font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span>{t.sastRatingTitle}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                    translatedScanResult.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : translatedScanResult.score >= 55 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {translatedScanResult.score >= 80 ? t.sastRatingGood : translatedScanResult.score >= 55 ? t.sastRatingWarn : t.sastRatingDanger}
                  </span>
                </h4>
                <p className="text-sm text-[#c9d1d9] leading-relaxed mb-4">
                  {translatedScanResult.summary}
                </p>

                {/* Meta stats row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-[#8b949e]" id="sast-meta-row">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>{t.sastFilesScanned} <strong>{translatedScanResult.totalFilesScanned}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span>{t.sastVulnerabilities} <strong className="text-red-400">{translatedScanResult.findings.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Exports */}
              <div className="flex flex-col gap-2.5 w-full md:w-auto" id="sast-exports">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-white transition-all cursor-pointer font-medium w-full"
                  title="Export .MD"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.sastBtnMd}</span>
                </button>
                <button
                  onClick={handleExportHtml}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-white transition-all cursor-pointer font-medium w-full"
                  title="Export HTML"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.sastBtnHtml}</span>
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 flex flex-col md:flex-row flex-wrap items-center justify-between gap-4" id="sast-filters-bar">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Category Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#8b949e] font-mono">{t.sastCategoryLabel}</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {categories.map((cat) => (
                       <option key={cat} value={cat}>
                        {cat === "ALL" ? t.sastFilterCat : getCategoryTranslation(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#8b949e] font-mono">{t.sastSeverityLabel}</span>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {severities.map((sev) => (
                      <option key={sev} value={sev}>
                        {sev === "ALL" ? t.sastFilterSev : sev}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72" id="sast-search-box">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8b949e]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.sastSearchPlaceholder}
                  className="bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 w-full transition-all"
                />
              </div>
            </div>

            {/* Findings List */}
            <div className="flex flex-col gap-4" id="sast-findings-list">
              <div className="flex items-center justify-between" id="sast-findings-title-row">
                <h5 className="text-xs font-mono text-[#8b949e] tracking-wider uppercase">
                  {t.sastFindingsTitle} ({filteredFindings.length})
                </h5>
              </div>

              {filteredFindings.length === 0 ? (
                <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-8 text-center" id="sast-no-filtered-findings">
                  <Info className="w-8 h-8 text-[#8b949e] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#8b949e]">
                    {t.sastNoFilteredFindings}
                  </p>
                </div>
              ) : (
                filteredFindings.map((finding, idx) => {
                  const sevConf = getSeverityColor(finding.severity);
                  const isExpanded = !!expandedFindings[idx];
                  return (
                    <div 
                      key={idx}
                      className="bg-[#161b22] border border-[#21262d] rounded-xl hover:border-accent/30 transition-all duration-300"
                      id={`finding-card-${idx}`}
                    >
                      {/* Card Header (Clickable) */}
                      <div 
                        onClick={() => toggleExpand(idx)}
                        className="p-4 flex items-start gap-3.5 cursor-pointer select-none"
                      >
                        <div className={`p-1.5 rounded-lg border flex-shrink-0 ${sevConf.bg} ${sevConf.border} ${sevConf.text}`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${sevConf.bg} ${sevConf.border} ${sevConf.text}`}>
                              {finding.severity}
                            </span>
                            <span className="text-xs text-txt-muted">|</span>
                            <span className="text-[11px] text-[#8b949e] font-mono bg-primary-bg px-2 py-0.5 rounded border border-[#21262d]">
                              {getCategoryTranslation(finding.category)}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {finding.ruleName}
                          </h4>
                          
                          <p className="text-xs text-[#8b949e] font-mono mt-1 truncate max-w-xl">
                            {finding.file} : <span className="text-cyan-400">{t.sastLineLabel} {finding.line}</span>
                          </p>
                        </div>

                        <div className="text-txt-muted hover:text-white p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Card Content (Expandable) */}
                      {isExpanded && (
                        <div className="px-4 pb-5 pt-1 border-t border-[#21262d] bg-[#1a1f29]/30 rounded-b-xl flex flex-col gap-4 animate-slide-down">
                          {/* File path detail */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#8b949e] font-mono">{t.sastFilePosition}</span>
                            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 flex items-center justify-between text-xs font-mono">
                              <span className="text-txt-main truncate">{finding.file}</span>
                              <span className="text-red-400 flex-shrink-0 font-bold ml-4">{t.sastLineLabel} {finding.line}</span>
                            </div>
                          </div>

                          {/* Code Segment */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#8b949e] font-mono flex items-center gap-1">
                              <Code className="w-3 h-3 text-red-400" />
                              {t.sastSuspiciousCode}
                            </span>
                            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-red-400 overflow-x-auto select-all leading-relaxed max-h-40">
                              <code>{finding.codeLine}</code>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-[#8b949e] font-mono">{t.sastRiskDesc}</span>
                            <p className="text-xs text-[#c9d1d9] leading-relaxed text-justify bg-red-950/10 p-3 rounded-lg border border-red-900/10">
                              {finding.description}
                            </p>
                          </div>

                          {/* Remediation */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              {t.sastRemediation}
                            </span>
                            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs leading-relaxed text-emerald-400/90 whitespace-pre-wrap">
                              {finding.remediation}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
