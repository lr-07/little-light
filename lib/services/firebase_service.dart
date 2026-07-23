import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? get currentUser => _auth.currentUser;

  Future<void> saveMoodJournal(Map<String, dynamic> data) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        await _firestore.collection('users').doc(userId).collection('journals').add({
          ...data,
          'timestamp': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('Failed to save journal: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getJournals() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        final snapshot = await _firestore
            .collection('users')
            .doc(userId)
            .collection('journals')
            .orderBy('timestamp', descending: true)
            .get();
        return snapshot.docs.map((doc) => doc.data()).toList();
      }
      return [];
    } catch (e) {
      print('Failed to get journals: $e');
      return [];
    }
  }

  Future<void> saveMood(String mood) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        await _firestore.collection('users').doc(userId).collection('moods').add({
          'mood': mood,
          'date': DateTime.now().toIso8601String(),
        });
      }
    } catch (e) {
      print('Failed to save mood: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getMoodHistory() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        final snapshot = await _firestore
            .collection('users')
            .doc(userId)
            .collection('moods')
            .orderBy('date', descending: true)
            .limit(30)
            .get();
        return snapshot.docs.map((doc) => doc.data()).toList();
      }
      return [];
    } catch (e) {
      print('Failed to get mood history: $e');
      return [];
    }
  }

  Future<void> updateJourneyProgress(int day) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        await _firestore.collection('users').doc(userId).update({
          'journeyDay': day,
          'lastUpdate': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('Failed to update journey: $e');
    }
  }

  Future<int?> getJourneyDay() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        final doc = await _firestore.collection('users').doc(userId).get();
        return doc.data()?['journeyDay'] as int? ?? 1;
      }
      return null;
    } catch (e) {
      print('Failed to get journey day: $e');
      return null;
    }
  }

  Future<void> addCommunityPost(Map<String, dynamic> post) async {
    try {
      await _firestore.collection('community').add({
        ...post,
        'timestamp': FieldValue.serverTimestamp(),
        'hugs': 0,
        'encouragements': [],
      });
    } catch (e) {
      print('Failed to add post: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getCommunityPosts() async {
    try {
      final snapshot = await _firestore
          .collection('community')
          .orderBy('timestamp', descending: true)
          .limit(20)
          .get();
      return snapshot.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
    } catch (e) {
      print('Failed to get posts: $e');
      return [];
    }
  }

  Future<void> hugPost(String postId) async {
    try {
      await _firestore.collection('community').doc(postId).update({
        'hugs': FieldValue.increment(1),
      });
    } catch (e) {
      print('Failed to hug post: $e');
    }
  }

  Future<void> addEncouragement(String postId, String encouragement) async {
    try {
      await _firestore.collection('community').doc(postId).update({
        'encouragements': FieldValue.arrayUnion([encouragement]),
      });
    } catch (e) {
      print('Failed to add encouragement: $e');
    }
  }

  Future<void> updateUserProfile(Map<String, dynamic> data) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        await _firestore.collection('users').doc(userId).set(
          data,
          SetOptions(merge: true),
        );
      }
    } catch (e) {
      print('Failed to update profile: $e');
    }
  }

  Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        final doc = await _firestore.collection('users').doc(userId).get();
        return doc.data();
      }
      return null;
    } catch (e) {
      print('Failed to get profile: $e');
      return null;
    }
  }

  Future<void> logChatMessage(String message, bool isUser) async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        await _firestore.collection('users').doc(userId).collection('chats').add({
          'message': message,
          'isUser': isUser,
          'timestamp': FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      print('Failed to log chat: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getChatHistory() async {
    try {
      final userId = _auth.currentUser?.uid;
      if (userId != null) {
        final snapshot = await _firestore
            .collection('users')
            .doc(userId)
            .collection('chats')
            .orderBy('timestamp')
            .limit(50)
            .get();
        return snapshot.docs.map((doc) => doc.data()).toList();
      }
      return [];
    } catch (e) {
      print('Failed to get chat history: $e');
      return [];
    }
  }
}