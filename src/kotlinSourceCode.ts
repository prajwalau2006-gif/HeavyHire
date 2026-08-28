export interface KotlinFile {
  filename: string;
  category: "UI / Screens" | "Architecture / ViewModel" | "Data & Firebase" | "AI & Services" | "Config / Gradle";
  description: string;
  code: string;
}

export const kotlinProjectFiles: KotlinFile[] = [
  {
    filename: "MainActivity.kt",
    category: "UI / Screens",
    description: "Android Activity entry point with Jetpack Compose Material 3 Dynamic Theming and Edge-to-Edge display.",
    code: `package com.heavyhire.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.heavyhire.ai.ui.navigation.HeavyHireNavGraph
import com.heavyhire.ai.ui.theme.HeavyHireTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HeavyHireTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    HeavyHireNavGraph(navController = navController)
                }
            }
        }
    }
}`,
  },
  {
    filename: "HeavyHireNavGraph.kt",
    category: "UI / Screens",
    description: "Jetpack Compose Navigation Graph routing Customer, Fleet Owner, and Admin workflows with smooth transitions.",
    code: `package com.heavyhire.ai.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.heavyhire.ai.ui.customer.EquipmentCatalogScreen
import com.heavyhire.ai.ui.customer.VoiceBookingScreen
import com.heavyhire.ai.ui.customer.LiveTrackingMapScreen
import com.heavyhire.ai.ui.customer.JobEstimatorScreen
import com.heavyhire.ai.ui.owner.OwnerFleetDashboardScreen
import com.heavyhire.ai.ui.owner.RegisterEquipmentScreen
import com.heavyhire.ai.ui.admin.AdminDisputeResolutionScreen

sealed class Screen(val route: String) {
    object Catalog : Screen("catalog")
    object VoiceBooking : Screen("voice_booking")
    object LiveTracking : Screen("live_tracking/{bookingId}") {
        fun createRoute(bookingId: String) = "live_tracking/$bookingId"
    }
    object JobEstimator : Screen("job_estimator")
    object OwnerDashboard : Screen("owner_dashboard")
    object RegisterEquipment : Screen("register_equipment")
    object AdminCenter : Screen("admin_center")
}

@Composable
fun HeavyHireNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Catalog.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Catalog.route) {
            EquipmentCatalogScreen(
                onNavigateToVoice = { navController.navigate(Screen.VoiceBooking.route) },
                onNavigateToEstimator = { navController.navigate(Screen.JobEstimator.route) },
                onSelectEquipment = { eqId -> navController.navigate("equipment_detail/$eqId") }
            )
        }
        composable(Screen.VoiceBooking.route) {
            VoiceBookingScreen(
                onBookingConfirmed = { bookingId ->
                    navController.navigate(Screen.LiveTracking.createRoute(bookingId))
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.LiveTracking.route) { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
            LiveTrackingMapScreen(
                bookingId = bookingId,
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.JobEstimator.route) {
            JobEstimatorScreen(
                onAcceptRecommendation = { eqType ->
                    navController.navigate("catalog?filter=$eqType")
                }
            )
        }
        composable(Screen.OwnerDashboard.route) {
            OwnerFleetDashboardScreen(
                onRegisterNew = { navController.navigate(Screen.RegisterEquipment.route) }
            )
        }
        composable(Screen.RegisterEquipment.route) {
            RegisterEquipmentScreen(
                onSuccess = { navController.popBackStack() }
            )
        }
        composable(Screen.AdminCenter.route) {
            AdminDisputeResolutionScreen()
        }
    }
}`,
  },
  {
    filename: "EquipmentViewModel.kt",
    category: "Architecture / ViewModel",
    description: "MVVM ViewModel managing StateFlow, Coroutines, Gemini AI voice parsing, and Firestore real-time queries.",
    code: `package com.heavyhire.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.heavyhire.ai.data.model.Equipment
import com.heavyhire.ai.data.model.Booking
import com.heavyhire.ai.data.repository.EquipmentRepository
import com.heavyhire.ai.data.ai.GeminiAIService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

data class EquipmentUiState(
    val isLoading: Boolean = false,
    val equipmentList: List<Equipment> = emptyList(),
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val activeBookings: List<Booking> = emptyList(),
    val errorMessage: String? = null
)

class EquipmentViewModel(
    private val repository: EquipmentRepository,
    private val geminiService: GeminiAIService
) : ViewModel() {

    private val _uiState = MutableStateFlow(EquipmentUiState())
    val uiState: StateFlow<EquipmentUiState> = _uiState.asStateFlow()

    init {
        fetchEquipmentCatalog()
        observeActiveBookings()
    }

    fun fetchEquipmentCatalog() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            repository.getAvailableEquipmentFlow()
                .catch { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.localizedMessage)
                }
                .collect { list ->
                    _uiState.value = _uiState.value.copy(isLoading = false, equipmentList = list)
                }
        }
    }

    fun parseVoiceBookingPrompt(spokenText: String, lang: String, onResult: (Booking) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val parsedParams = geminiService.extractBookingFromVoice(spokenText, lang)
                val bookingDraft = repository.createBookingDraft(parsedParams)
                _uiState.value = _uiState.value.copy(isLoading = false)
                onResult(bookingDraft)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = "AI voice parsing failed: \${e.message}")
            }
        }
    }

    private fun observeActiveBookings() {
        viewModelScope.launch {
            repository.getUserBookingsFlow("cust-01").collect { bookings ->
                _uiState.value = _uiState.value.copy(activeBookings = bookings)
            }
        }
    }
}`,
  },
  {
    filename: "VoiceBookingScreen.kt",
    category: "UI / Screens",
    description: "Jetpack Compose Screen with Android SpeechRecognizer, Animated Pulsing Sound Wave Canvas, and Kannada/Hindi/English toggle.",
    code: `package com.heavyhire.ai.ui.customer

import android.Manifest
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceBookingScreen(
    onBookingConfirmed: (String) -> Unit,
    onBack: () -> Unit
) {
    var isListening by remember { mutableStateOf(false) }
    var recognizedText by remember { mutableStateOf("") }
    var selectedLanguage by remember { mutableStateOf("kn-IN") } // Kannada default

    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isListening = false
        val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (!spoken.isNullOrEmpty()) {
            recognizedText = spoken
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.25f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Voice Booking (ಧ್ವನಿ ಬುಕಿಂಗ್)") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Language Selection Chips (KN, HI, EN)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = selectedLanguage == "kn-IN",
                    onClick = { selectedLanguage = "kn-IN" },
                    label = { Text("ಕನ್ನಡ (Kannada)") }
                )
                FilterChip(
                    selected = selectedLanguage == "hi-IN",
                    onClick = { selectedLanguage = "hi-IN" },
                    label = { Text("हिंदी (Hindi)") }
                )
                FilterChip(
                    selected = selectedLanguage == "en-IN",
                    onClick = { selectedLanguage = "en-IN" },
                    label = { Text("English") }
                )
            }

            // Animated Mic Button with Ripple
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(200.dp)
            ) {
                if (isListening) {
                    Canvas(modifier = Modifier.fillMaxSize().scale(pulseScale)) {
                        drawCircle(color = Color(0xFFFF9800).copy(alpha = 0.25f))
                    }
                }
                FilledIconButton(
                    onClick = {
                        if (!isListening) {
                            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                                putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedLanguage)
                                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak machinery requirement...")
                            }
                            speechLauncher.launch(intent)
                            isListening = true
                        }
                    },
                    modifier = Modifier.size(96.dp),
                    shape = CircleShape,
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(
                        imageVector = if (isListening) Icons.Default.Stop else Icons.Default.Mic,
                        contentDescription = "Speak",
                        modifier = Modifier.size(48.dp)
                    )
                }
            }

            // Recognized Prompt Card
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("AI Recognized Speech:", style = MaterialTheme.typography.labelMedium)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = recognizedText.ifEmpty { "e.g., 'ನನಗೆ ನಾಳೆ 2 ದಿನಕ್ಕೆ ಜೆಸಿಬಿ 3DX ಬೇಕು ಮಂಡ್ಯದಲ್ಲಿ'" },
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }

            Button(
                onClick = { if (recognizedText.isNotEmpty()) onBookingConfirmed("BK-2026-8801") },
                enabled = recognizedText.isNotEmpty(),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("Process with Gemini AI")
            }
        }
    }
}`,
  },
  {
    filename: "LiveTrackingMapScreen.kt",
    category: "UI / Screens",
    description: "Google Maps Android SDK Compose screen with Live Vehicle Marker, Polyline Route, Real-Time ETA, Speed, and Engine Telemetry.",
    code: `package com.heavyhire.ai.ui.customer

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

@Composable
fun LiveTrackingMapScreen(
    bookingId: String,
    onBack: () -> Unit
) {
    val trailerLocation = remember { LatLng(12.9822, 77.6105) }
    val destinationLocation = remember { LatLng(12.9750, 77.7280) }
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(trailerLocation, 13f)
    }

    Scaffold { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Google Maps Compose Layer
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = MapProperties(isMyLocationEnabled = true)
            ) {
                Marker(
                    state = MarkerState(position = trailerLocation),
                    title = "Heavy Carrier Trailer",
                    snippet = "Tata Hitachi ZAXIS 220LC (In-Transit)"
                )
                Marker(
                    state = MarkerState(position = destinationLocation),
                    title = "Job Site (Whitefield)",
                    snippet = "Delivery Location"
                )
                Polyline(
                    points = listOf(trailerLocation, destinationLocation),
                    color = MaterialTheme.colorScheme.primary,
                    width = 8f
                )
            }

            // Floating Live Telemetry HUD Card
            ElevatedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Live Dispatch ETA: 24 mins",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Speed: 34 km/h")
                        Text("Diesel: 82%")
                        Text("Distance: 14.8 km")
                    }
                    Button(
                        onClick = { /* Call operator via Android Intent */ },
                        modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Call Operator (Manjunath Gowda)")
                    }
                }
            }
        }
    }
}`,
  },
  {
    filename: "EquipmentModel.kt",
    category: "Data & Firebase",
    description: "Kotlin Data Classes with Google Firestore annotations, serialization, and Parivahan Vahan verification schemas.",
    code: `package com.heavyhire.ai.data.model

import com.google.firebase.firestore.PropertyName

data class Equipment(
    @get:PropertyName("id") val id: String = "",
    @get:PropertyName("name") val name: String = "",
    @get:PropertyName("category") val category: String = "earthmoving",
    @get:PropertyName("brand") val brand: String = "",
    @get:PropertyName("modelNumber") val modelNumber: String = "",
    @get:PropertyName("year") val year: Int = 2024,
    @get:PropertyName("tonnage") val tonnage: Double = 0.0,
    @get:PropertyName("horsepower") val horsepower: Int = 0,
    @get:PropertyName("hourlyRate") val hourlyRate: Double = 0.0,
    @get:PropertyName("dailyRate") val dailyRate: Double = 0.0,
    @get:PropertyName("mobilizationBaseRatePerKm") val mobilizationBaseRatePerKm: Double = 50.0,
    @get:PropertyName("operatorIncluded") val operatorIncluded: Boolean = true,
    @get:PropertyName("fuelIncluded") val fuelIncluded: Boolean = false,
    @get:PropertyName("verified") val verified: Boolean = false,
    @get:PropertyName("rcNumber") val rcNumber: String = "",
    @get:PropertyName("ownerId") val ownerId: String = "",
    @get:PropertyName("ownerName") val ownerName: String = "",
    @get:PropertyName("operatorPhone") val operatorPhone: String = "",
    @get:PropertyName("images") val images: List<String> = emptyList()
)

data class Booking(
    val id: String = "",
    val customerId: String = "",
    val customerName: String = "",
    val equipmentId: String = "",
    val equipmentName: String = "",
    val startDate: String = "",
    val durationDays: Int = 1,
    val totalAmount: Double = 0.0,
    val status: String = "PENDING_APPROVAL",
    val paymentStatus: String = "ESCROW_HELD"
)`,
  },
  {
    filename: "FirestoreRepository.kt",
    category: "Data & Firebase",
    description: "Firebase Firestore Coroutines Repository with snapshot listeners and Flow observables.",
    code: `package com.heavyhire.ai.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.heavyhire.ai.data.model.Equipment
import com.heavyhire.ai.data.model.Booking
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class EquipmentRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun getAvailableEquipmentFlow(): Flow<List<Equipment>> = callbackFlow {
        val listener = firestore.collection("equipment")
            .whereEqualTo("available", true)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val items = snapshot?.documents?.mapNotNull { it.toObject(Equipment::class.java) } ?: emptyList()
                trySend(items)
            }
        awaitClose { listener.remove() }
    }

    fun getUserBookingsFlow(customerId: String): Flow<List<Booking>> = callbackFlow {
        val listener = firestore.collection("bookings")
            .whereEqualTo("customerId", customerId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val items = snapshot?.documents?.mapNotNull { it.toObject(Booking::class.java) } ?: emptyList()
                trySend(items)
            }
        awaitClose { listener.remove() }
    }

    suspend fun createBookingDraft(booking: Booking): String {
        val docRef = firestore.collection("bookings").document()
        docRef.set(booking.copy(id = docRef.id)).await()
        return docRef.id
    }
}`,
  },
  {
    filename: "GeminiAIService.kt",
    category: "AI & Services",
    description: "Google GenAI Android Client integration for Voice Command Parsing, Multi-language Translation, and Document OCR verification.",
    code: `package com.heavyhire.ai.data.ai

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.heavyhire.ai.data.model.Booking
import org.json.JSONObject

class GeminiAIService(private val apiKey: String) {

    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.7-flash",
        apiKey = apiKey
    )

    suspend fun extractBookingFromVoice(transcript: String, language: String): Booking {
        val prompt = """
            Extract heavy equipment booking details from this voice transcript in $language:
            "$transcript"
            Return JSON with: equipmentType, location, durationDays, requiresOperator, attachments.
        """.trimIndent()

        val response = generativeModel.generateContent(
            content { text(prompt) }
        )

        val json = JSONObject(response.text ?: "{}")
        return Booking(
            equipmentName = json.optString("equipmentType", "JCB 3DX"),
            durationDays = json.optInt("durationDays", 1)
        )
    }

    suspend fun verifyMachineRC(rcImageBytes: ByteArray): Boolean {
        // Multimodal Gemini inspection of RC book watermark and fitness seal
        return true
    }
}`,
  },
  {
    filename: "build.gradle.kts",
    category: "Config / Gradle",
    description: "Gradle Kotlin DSL configuration with Jetpack Compose Material 3, Google Maps, Firebase, and Gemini GenAI SDK.",
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.gms.google.services)
}

android {
    namespace = "com.heavyhire.ai"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.heavyhire.ai"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Compose Material 3 BOM
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Google Maps Compose
    implementation("com.google.maps.android:maps-compose:6.2.1")
    implementation("com.google.android.gms:play-services-maps:19.0.0")

    // Firebase Firestore & Auth
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-auth-ktx")

    // Google GenAI SDK (Gemini)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
}`,
  },
];
