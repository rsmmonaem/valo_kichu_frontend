"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Upload, Trash2, Save, Image as ImageIcon, ChevronDown, Check, Tag, Settings } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import RichTextEditor from './RichTextEditor';

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
    const resolveImageUrl = (imgNameOrUrl: string) => {
        if (!imgNameOrUrl) return '';
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
        let cleanUrl = imgNameOrUrl;
        if (!imgNameOrUrl.startsWith('http')) {
            cleanUrl = `${baseUrl}/storage/products/${imgNameOrUrl.replace(/^\/?(storage\/products|products)\/?/, '')}`;
        }
        if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1')) {
            const filename = cleanUrl.split('/').pop() || '';
            if (filename.startsWith('ss')) {
                return cleanUrl.replace(/^https?:\/\/[^/]+/, 'https://backend.valokichu.com');
            }
        }
        return cleanUrl;
    };

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [subSubCategories, setSubSubCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category_id: "",
        sub_category_id: "",
        sub_sub_category_id: "",
        brand: "",
        product_type: "Physical",
        product_sku: "",
        unit: "kg",
        price: "",
        purchase_price: "",
        unit_price: "",
        min_order_qty: 1,
        current_stock: 0,
        discount_type: "None",
        discount_amount: 0,
        tax_amount: 0,
        tax_calculation: "Include With Product",
        shipping_cost: 0,
        shipping_multiply: true,
        loyalty_point: 0,
        image: "",
        gallery_images: [] as string[],
        status: "active",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
    });

    // Tags and Specifications
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [specifications, setSpecifications] = useState<string>("");

    // Variations and Attributes
    const [selectedColors, setSelectedColors] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);
    const [variations, setVariations] = useState<any[]>([]);

    // Available Options State
    const [availableColors, setAvailableColors] = useState<any[]>([
        { id: 1, name: "Yellow", color: "bg-yellow-500" },
        { id: 2, name: "WhiteSmoke", color: "bg-gray-300" },
        { id: 3, name: "Red", color: "bg-red-500" },
        { id: 4, name: "Blue", color: "bg-blue-500" },
        { id: 5, name: "Green", color: "bg-green-500" },
        { id: 6, name: "Black", color: "bg-black" },
    ]);

    const [showColorCreator, setShowColorCreator] = useState(false);
    const [newColorName, setNewColorName] = useState("");
    const [newColorHex, setNewColorHex] = useState("#000000");

    // Load custom colors from localStorage on mount
    useEffect(() => {
        const savedColors = localStorage.getItem('custom_colors');
        if (savedColors) {
            try {
                const parsed = JSON.parse(savedColors);
                setAvailableColors(prev => {
                    const combined = [...prev];
                    parsed.forEach((c: any) => {
                        if (c.name && !combined.some(item => item.name.toLowerCase() === c.name.toLowerCase())) {
                            combined.push(c);
                        }
                    });
                    return combined;
                });
            } catch (e) {
                console.error("Failed to parse custom colors", e);
            }
        }
    }, []);

    const handleCreateCustomColor = (name: string, hex: string) => {
        const cleanedName = name.trim();
        const cleanedHex = hex.trim();
        if (!cleanedName || !cleanedHex) return;

        const lowerName = cleanedName.toLowerCase();
        if (availableColors.some(c => c.name.toLowerCase() === lowerName)) {
            toast.error("Color name already exists");
            return;
        }

        const newId = availableColors.length > 0 ? Math.max(...availableColors.map(c => c.id)) + 1 : 1;
        const newColor = {
            id: newId,
            name: cleanedName,
            color: cleanedHex
        };

        const updatedAvailable = [...availableColors, newColor];
        setAvailableColors(updatedAvailable);
        setSelectedColors(prev => {
            if (prev.some(c => c.name.toLowerCase() === lowerName)) return prev;
            return [...prev, newColor];
        });

        // Save only custom ones to local storage (id > 6)
        const customOnly = updatedAvailable.filter(c => c.id > 6);
        localStorage.setItem('custom_colors', JSON.stringify(customOnly));

        toast.success(`Color "${cleanedName}" added and selected`);
    };

    const availAttributes = [
        { id: 1, name: "Weight" },
        { id: 2, name: "Size" },
        { id: 3, name: "Ram size" },
        { id: 4, name: "Storage" },
    ];

    useEffect(() => {
        fetchCategories();
        fetchBrands();
        if (initialData) {
            initializeForm(initialData);
        }
    }, [initialData]);

    const initializeForm = (data: any) => {
        setFormData(prev => ({
            ...prev,
            name: data.name || "",
            description: data.description || "",
            category_id: data.category_id || "",
            sub_category_id: data.sub_category_id || "",
            sub_sub_category_id: data.sub_sub_category_id || "",
            brand: data.brand || "",
            product_type: data.product_type || "Physical",
            product_sku: data.product_sku || "",
            unit: data.unit || "kg",
            price: data.price || "",
            purchase_price: data.purchase_price || "",
            unit_price: data.unit_price || "",
            min_order_qty: data.min_order_qty || 1,
            current_stock: data.current_stock || 0,
            discount_type: data.discount_type || "None",
            discount_amount: data.discount_amount || 0,
            tax_amount: data.tax_amount || 0,
            tax_calculation: data.tax_calculation || "Include With Product",
            shipping_cost: data.shipping_cost || 0,
            shipping_multiply: data.shipping_multiply !== undefined ? data.shipping_multiply : true,
            loyalty_point: data.loyalty_point || 0,
            image: data.image || "",
            gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
            status: data.status || "active",
            meta_title: data.meta_title || "",
            meta_description: data.meta_description || "",
            meta_keywords: data.meta_keywords || ""
        }));

        if (data.tags) setTags(Array.isArray(data.tags) ? data.tags : []);
        if (data.specifications) {
            if (typeof data.specifications === 'string') {
                setSpecifications(data.specifications);
            } else if (Array.isArray(data.specifications)) {
                // Legacy: join array items into HTML list
                setSpecifications('<ul>' + data.specifications.map((s: string) => `<li>${s}</li>`).join('') + '</ul>');
            }
        }
        if (data.colors) {
            const mappedColors = (Array.isArray(data.colors) ? data.colors : []).map((c: any) => ({
                id: c.id,
                name: c.name,
                color: c.color_class || c.color || "",
                image: c.image || null
            }));
            setSelectedColors(mappedColors);
            
            // Add custom loaded colors to availableColors list if they aren't already there
            setAvailableColors(prev => {
                const combined = [...prev];
                mappedColors.forEach((mc: any) => {
                    if (mc.name && !combined.some(ac => ac.name.toLowerCase() === mc.name.toLowerCase())) {
                        combined.push({
                            id: mc.id || (combined.length > 0 ? Math.max(...combined.map(item => item.id)) + 1 : 1),
                            name: mc.name,
                            color: mc.color
                        });
                    }
                });
                return combined;
            });
        }
        if (data.variations) setVariations(Array.isArray(data.variations) ? data.variations : []);
        if (data.attributes) setAttributes(Array.isArray(data.attributes) ? data.attributes : []);
    };

    const fetchCategories = async () => {
        try {
            const res = await authFetch('/admin/v1/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (e) {
            console.error("Failed to fetch categories", e);
            toast.error("Failed to load categories");
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await authFetch('/admin/v1/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data || []);
            }
        } catch (e) {
            const mockBrands = [
                { id: 1, name: "Nike" },
                { id: 2, name: "Adidas" },
                { id: 3, name: "Apple" },
                { id: 4, name: "Samsung" },
                { id: 5, name: "Sony" },
            ];
            setBrands(mockBrands);
        }
    };

    // ========== FORM HANDLERS ==========
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ========== CATEGORY HANDLERS ==========
    const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        const selected = categories.find(c => c.id === id);
        setSubCategories(selected?.children || []);
        setSubSubCategories([]);
        setFormData(prev => ({
            ...prev,
            category_id: e.target.value,
            sub_category_id: "",
            sub_sub_category_id: ""
        }));
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        const selected = subCategories.find(c => c.id === id);
        setSubSubCategories(selected?.children || []);
        setFormData(prev => ({
            ...prev,
            sub_category_id: e.target.value,
            sub_sub_category_id: ""
        }));
    };

    const handleSubSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            sub_sub_category_id: e.target.value
        }));
    };

    // ========== TAG HANDLERS ==========
    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };



    // ========== COLOR HANDLERS ==========
    const handleColorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const colorId = parseInt(e.target.value);
        if (!colorId) return;

        const color = availableColors.find(c => c.id === colorId);
        if (color && !selectedColors.find(sc => sc.id === colorId)) {
            setSelectedColors([...selectedColors, color]);
            e.target.value = "";
        }
    };

    const handleRemoveColor = (colorId: number) => {
        setSelectedColors(selectedColors.filter((c: any) => c.id !== colorId));
    };

    // ========== ATTRIBUTE HANDLERS ==========
    const handleAttributeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const attrId = parseInt(e.target.value);
        if (!attrId) return;

        const attribute = availAttributes.find((attr: any) => attr.id === attrId);
        if (!attribute) return;

        if (attributes.some(a => a.id === attrId)) return;

        setAttributes([...attributes, { ...attribute, values: [] }]);
        e.target.value = "";
    };

    const addAttributeValue = (attrId: number, newValue: string) => {
        if (!newValue.trim()) return;

        setAttributes(prev =>
            prev.map((attr: any) => {
                if (attr.id !== attrId) return attr;
                if (attr.values.includes(newValue.trim())) return attr;
                return {
                    ...attr,
                    values: [...attr.values, newValue.trim()]
                };
            })
        );
    };

    const removeAttributeValue = (attrId: number, valueToRemove: string) => {
        setAttributes(prev =>
            prev.map((attr: any) => {
                if (attr.id !== attrId) return attr;
                return {
                    ...attr,
                    values: attr.values.filter((val: string) => val !== valueToRemove)
                };
            })
        );
    };

    const handleRemoveAttribute = (attrId: number) => {
        setAttributes(attributes.filter((a: any) => a.id !== attrId));
    };

    // ========== VARIATION GENERATION ==========
    const generateVariations = useCallback(() => {
        if (selectedColors.length === 0) {
            setVariations([]);
            return;
        }

        const attributesWithValues = attributes.filter((attr: any) => attr.values && attr.values.length > 0);

        // Generate base variations from selected colors
        let baseVariations = selectedColors.map((color: any, index: number) => ({
            id: index + 1,
            color: color.name,
            colorClass: color.color,
            code: "",
            sku: `${formData.product_sku || "VAR"}-${color.name.replace(/\s+/g, "-")}`,
            stock: 1,
            price: parseFloat(formData.price) || 0,
            colorId: color.id,
            attributes: {},
        }));

        // If no attributes with values, set base variations
        if (attributesWithValues.length === 0) {
            setVariations(baseVariations);
            return;
        }

        // Generate all combinations
        let allVariations: any[] = [];

        baseVariations.forEach(baseVar => {
            let variationsForThisColor = [baseVar];

            attributesWithValues.forEach((attr: any) => {
                const newVariations: any[] = [];

                variationsForThisColor.forEach((variation: any) => {
                    attr.values.forEach((attrValue: string) => {
                        const attributePart = attrValue.replace(/\s+/g, "-");
                        const newSku = `${variation.sku.split("-")[0]}-${variation.color.replace(/\s+/g, "-")}-${attributePart}`;

                        newVariations.push({
                            ...variation,
                            id: 0,
                            sku: newSku,
                            attributes: {
                                ...(variation.attributes || {}),
                                [attr.name]: attrValue,
                            },
                        });
                    });
                });

                variationsForThisColor = newVariations;
            });

            allVariations.push(...variationsForThisColor);
        });

        // Remove duplicates
        const uniqueVariations: any[] = [];
        const seenSkus = new Set();

        allVariations.forEach(variation => {
            if (!seenSkus.has(variation.sku)) {
                seenSkus.add(variation.sku);
                uniqueVariations.push(variation);
            }
        });

        // Assign proper IDs and PRESERVE existing data if possible
        const finalVariations = uniqueVariations.map((variation, index) => {
            // Try to find if this variation already exists (by color and attributes)
            const existing = (variations || []).find(v => {
                if (v.color !== variation.color) return false;
                const vAttrs = v.attributes || {};
                const varAttrs = variation.attributes || {};
                if (Object.keys(vAttrs).length !== Object.keys(varAttrs).length) return false;
                return Object.entries(varAttrs).every(([key, val]) => vAttrs[key] === val);
            });

            if (existing) {
                return {
                    ...variation,
                    id: index + 1,
                    sku: existing.sku || variation.sku,
                    stock: existing.stock !== undefined ? existing.stock : variation.stock,
                    price: existing.price !== undefined ? existing.price : (variation.price || parseFloat(formData.price) || 0),
                };
            }

            return {
                ...variation,
                id: index + 1,
                price: variation.price || parseFloat(formData.price) || 0,
            };
        });

        setVariations(finalVariations);
    }, [selectedColors, attributes, formData.price, formData.product_sku]);

    useEffect(() => {
        generateVariations();
    }, [generateVariations]);

    const handleVariationChange = (id: number, field: string, value: any) => {
        setVariations(prevVariations =>
            prevVariations.map((variation: any) =>
                variation.id === id
                    ? {
                        ...variation,
                        [field]: field === "price" ? parseFloat(value) || 0 : value,
                    }
                    : variation
            )
        );
    };

    const handleAddVariation = () => {
        const newId = variations.length > 0 ? Math.max(...variations.map(v => v.id)) + 1 : 1;

        const newVariation = {
            id: newId,
            color: "Custom",
            colorClass: "bg-gray-400",
            code: "",
            sku: `${formData.product_sku || "CUSTOM"}-${newId}`,
            stock: 1,
            price: parseFloat(formData.price) || 0,
            isCustom: true,
        };

        setVariations([...variations, newVariation]);
    };

    // ========== IMAGE UPLOAD ==========
    const handleImageUpload = async (files: FileList, field: 'image' | 'gallery' | 'color', colorId?: number) => {
        if (!files || files.length === 0) return;

        try {
            if (field === 'gallery') {
                setGalleryUploading(true);
                const uploadedImages: string[] = [];

                for (const file of Array.from(files)) {
                    if (file.size > 5 * 1024 * 1024) {
                        toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`);
                        continue;
                    }

                    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        toast.error(`File "${file.name}" is not a valid image type.`);
                        continue;
                    }

                    const fd = new FormData();
                    fd.append('image', file);
                    // fd.append('folder', 'products/gallery');
                    fd.append('folder', 'products');

                    const res = await authFetch('/admin/v1/upload', {
                        method: 'POST',
                        body: fd
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const imageUrl = data.path.split('/').pop();
                        uploadedImages.push(imageUrl);
                    }
                }

                if (uploadedImages.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        gallery_images: [...prev.gallery_images, ...uploadedImages]
                    }));
                    toast.success(`Uploaded ${uploadedImages.length} image(s)`);
                }
            } else {
                const file = files[0];
                const fd = new FormData();
                fd.append('image', file);
                fd.append('folder', 'products');

                const res = await authFetch('/admin/v1/upload', {
                    method: 'POST',
                    body: fd
                });

                if (res.ok) {
                    const data = await res.json();
                    const imageUrl = data.path.split('/').pop();

                    if (field === 'image') {
                        setFormData(prev => ({ ...prev, image: imageUrl }));
                    } else if (field === 'color' && colorId) {
                        setSelectedColors(prev =>
                            prev.map((color: any) =>
                                color.id === colorId
                                    ? { ...color, image: imageUrl }
                                    : color
                            )
                        );
                    }
                    toast.success("Image uploaded");
                }
            }
        } catch (error) {
            toast.error("Failed to upload image");
            console.error("Upload error:", error);
        } finally {
            if (field === 'gallery') {
                setGalleryUploading(false);
            }
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images.filter((_, i) => i !== index)
        }));
    };

    const clearAllGalleryImages = () => {
        if (confirm("Are you sure you want to remove all gallery images?")) {
            setFormData(prev => ({ ...prev, gallery_images: [] }));
        }
    };

    // ========== SKU GENERATION ==========
    const handleGenerateSKU = () => {
        const randomSKU = `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setFormData(prev => ({ ...prev, product_sku: randomSKU }));

        if (variations.length > 0) {
            setVariations(
                variations.map(v => ({
                    ...v,
                    sku: v.sku.replace(/^[^-]+/, randomSKU.split("-")[0]),
                }))
            );
        }
    };

    // ========== FORM SUBMISSION ==========
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Calculate final price
        let finalPrice = parseFloat(formData.price) || 0;
        if (formData.discount_type === "Flat") {
            finalPrice -= parseFloat(formData.discount_amount.toString()) || 0;
        } else if (formData.discount_type === "Percent") {
            finalPrice -= (finalPrice * (parseFloat(formData.discount_amount.toString()) || 0)) / 100;
        }

        const payload = {
            // Basic Information
            name: formData.name,
            description: formData.description,

            // Category Information
            category_id: formData.sub_sub_category_id || formData.sub_category_id || formData.category_id,
            brand: formData.brand,

            // Specifications & Tags
            specifications: specifications,
            tags: tags,

            // Product Details
            product_type: formData.product_type,
            product_sku: formData.product_sku,
            unit: formData.unit,

            // Pricing Information
            price: finalPrice,
            purchase_price: parseFloat(formData.purchase_price.toString()) || 0,
            unit_price: parseFloat(formData.unit_price.toString()) || 0,

            // Stock Information
            min_order_qty: parseInt(formData.min_order_qty.toString()) || 1,
            current_stock: parseInt(formData.current_stock.toString()) || 0,

            // Discount Information
            discount_type: formData.discount_type,
            discount_amount: parseFloat(formData.discount_amount.toString()) || 0,

            // Tax Information
            tax_amount: parseFloat(formData.tax_amount.toString()) || 0,
            tax_calculation: formData.tax_calculation,

            // Shipping Information
            shipping_cost: parseFloat(formData.shipping_cost.toString()) || 0,
            shipping_multiply: formData.shipping_multiply,

            // Loyalty Points
            loyalty_point: parseFloat(formData.loyalty_point.toString()) || 0,

            // Images
            image: formData.image,
            gallery_images: formData.gallery_images || [],

            // Variations
            variations: variations.map((variation: any) => ({
                id: variation.id,
                color: variation.color,
                colorClass: variation.colorClass,
                code: variation.code,
                sku: variation.sku,
                stock: (variation.stock !== undefined && variation.stock !== null && variation.stock !== "") ? parseInt(variation.stock) : 0,
                price: (variation.price !== undefined && variation.price !== null && variation.price !== "") ? parseFloat(variation.price) : finalPrice,
                color_image: selectedColors.find(c => c.name === variation.color)?.image || null,
                attributes: variation.attributes || {},
            })),

            // Attributes
            attributes: attributes.map((attr: any) => ({
                name: attr.name,
                values: attr.values || []
            })),

            // Colors
            colors: selectedColors.map((color: any) => ({
                id: color.id,
                name: color.name,
                color_class: color.color,
                image: color.image || null,
            })),

            // SEO Metadata
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            meta_keywords: formData.meta_keywords,

            // Additional metadata
            status: formData.status,
            is_featured: false,
            is_trending: false,
            is_discounted: formData.discount_type !== "None",
        };

        const url = isEdit && initialData
            ? `/admin/v1/products/${initialData.id}`
            : '/admin/v1/products';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(isEdit ? "Product updated successfully" : "Product created successfully");
                router.push('/admin/products');
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to save product");
            }
        } catch (error) {
            toast.error("An error occurred while saving the product");
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            category_id: "",
            sub_category_id: "",
            sub_sub_category_id: "",
            brand: "",
            product_type: "Physical",
            product_sku: "",
            unit: "kg",
            price: "",
            purchase_price: "",
            unit_price: "",
            min_order_qty: 1,
            current_stock: 0,
            discount_type: "None",
            discount_amount: 0,
            tax_amount: 0,
            tax_calculation: "Include With Product",
            shipping_cost: 0,
            shipping_multiply: true,
            loyalty_point: 0,
            image: "",
            gallery_images: [],
            status: "active",
            meta_title: "",
            meta_description: "",
            meta_keywords: ""
        });
        setTags([]);
        setSpecifications("");
        setSelectedColors([]);
        setAttributes([]);
        setVariations([]);
        setSubCategories([]);
        setSubSubCategories([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-black">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Product Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Product Information
                        </h2>

                        <div className="space-y-6">
                            {/* Product Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Selling Price (৳) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">৳</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter product description"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Specifications
                        </h2>
                        <p className="text-xs text-gray-400 mb-3">Write product specifications using the rich text editor below. Supports bold, lists, headings, and more.</p>
                        <RichTextEditor
                            value={specifications}
                            onChange={(val) => setSpecifications(val)}
                            placeholder="e.g., Material: 100% Cotton, Weight: 250g, Size: S-XXL..."
                            minHeight="200px"
                        />
                    </div>

                    {/* Category Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Category
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Category */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Category *
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.category_id}
                                        onChange={handleMainCategoryChange}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {(Array.isArray(categories) ? categories : []).map((cat) => (
                                            <option key={`cat-${cat.id}`} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Sub Category */}
                            {subCategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Sub Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.sub_category_id}
                                            onChange={handleSubCategoryChange}
                                        >
                                            <option value="">Select Sub Category</option>
                                            {(Array.isArray(subCategories) ? subCategories : []).map((sub) => (
                                                <option key={`sub-${sub.id}`} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Sub Sub Category */}
                            {subSubCategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Sub Sub Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.sub_sub_category_id}
                                            onChange={handleSubSubCategoryChange}
                                        >
                                            <option value="">Select Sub Sub Category</option>
                                            {(Array.isArray(subSubCategories) ? subSubCategories : []).map((sub) => (
                                                <option key={`subsub-${sub.id}`} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Brand */}
                        <div className="mt-6 space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Brand
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Brand</option>
                                    {(Array.isArray(brands) ? brands : []).map((brand) => (
                                        <option key={`brand-${brand.id}`} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Product Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Product Type
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="product_type"
                                        value={formData.product_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Physical">Physical</option>
                                        <option value="Digital">Digital</option>
                                        <option value="Service">Service</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Unit */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Unit
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="oz">oz</option>
                                        <option value="piece">piece</option>
                                        <option value="pack">pack</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Product SKU */}
                        <div className="mt-6 space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                Product SKU
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter product SKU"
                                    name="product_sku"
                                    value={formData.product_sku}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateSKU}
                                    className="px-6 py-3 bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                                >
                                    Generate Code
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Other */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Pricing & Other
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Purchase Price */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Purchase price (৳)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Purchase price"
                                        name="purchase_price"
                                        value={formData.purchase_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">৳</span>
                                    </div>
                                </div>
                            </div>

                            {/* Unit Price */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Unit Price (৳)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Unit price"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">৳</span>
                                    </div>
                                </div>
                            </div>

                            {/* Minimum Order Qty */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Minimum order qty
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Minimum order qty"
                                    name="min_order_qty"
                                    value={formData.min_order_qty}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                            </div>

                            {/* Current Stock Qty */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Current stock qty
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Current stock qty"
                                    name="current_stock"
                                    value={formData.current_stock}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>

                            {/* Discount Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Discount Type
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="discount_type"
                                        value={formData.discount_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="None">None</option>
                                        <option value="Flat">Flat</option>
                                        <option value="Percent">Percent</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Discount Amount */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Discount amount
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Discount amount"
                                        name="discount_amount"
                                        value={formData.discount_amount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">
                                            {formData.discount_type === "Percent" ? "%" : "৳"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tax Amount */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Tax amount (%)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Tax amount"
                                    name="tax_amount"
                                    value={formData.tax_amount}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>

                            {/* Tax Calculation */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Tax calculation
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        name="tax_calculation"
                                        value={formData.tax_calculation}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Include With Product">Include With Product</option>
                                        <option value="Exclude With Product">Exclude With Product</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Shipping Cost */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Shipping cost (৳)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Shipping cost"
                                        name="shipping_cost"
                                        value={formData.shipping_cost}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">৳</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Cost Multiply */}
                            <div className="space-y-2 h-12">
                                <label className="block text-sm font-medium text-gray-600">
                                    Shipping Settings
                                </label>
                                <div className="flex items-center justify-between h-full px-4 py-3 bg-white border border-gray-300 rounded-lg">
                                    <h3 className="font-medium text-gray-800">
                                        Shipping Cost Multiply With Quantity
                                    </h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.shipping_multiply}
                                            onChange={(e) => setFormData(prev => ({ ...prev, shipping_multiply: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Loyalty Point */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Loyalty point (৳)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Loyalty point"
                                        name="loyalty_point"
                                        value={formData.loyalty_point}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500">৳</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Variation Setup */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h1 className="text-xl font-bold text-gray-800 mb-6">
                            Product variation setup
                        </h1>

                        <div className="space-y-8">
                            {/* Colors and Attributes Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Colors Selection */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Select Colors:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowColorCreator(!showColorCreator)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 focus:outline-none"
                                        >
                                            <Plus size={14} /> Create Custom Color
                                        </button>
                                    </div>

                                    {!showColorCreator ? (
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                onChange={handleColorSelect}
                                                defaultValue=""
                                            >
                                                <option value="">Select Color</option>
                                                {(availableColors || []).map((color) => (
                                                    <option key={`avail-color-${color.id}`} value={color.id}>
                                                        {color.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <h4 className="text-sm font-bold text-gray-700">Create Custom Color</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="block text-xs text-gray-500 font-medium">Color Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Lavender"
                                                        value={newColorName}
                                                        onChange={(e) => setNewColorName(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-xs text-gray-500 font-medium">Color Code</label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                placeholder="#000000"
                                                                value={newColorHex}
                                                                onChange={(e) => setNewColorHex(e.target.value)}
                                                                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                                            />
                                                            <div 
                                                                className="absolute left-2.5 top-2.5 w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                                                style={{ backgroundColor: newColorHex }}
                                                            />
                                                        </div>
                                                        <input
                                                            type="color"
                                                            value={newColorHex}
                                                            onChange={(e) => setNewColorHex(e.target.value)}
                                                            className="w-10 h-9 p-0 border border-gray-300 rounded-lg cursor-pointer bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowColorCreator(false);
                                                        setNewColorName("");
                                                        setNewColorHex("#000000");
                                                    }}
                                                    className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!newColorName.trim()) {
                                                            toast.error("Please enter a color name");
                                                            return;
                                                        }
                                                        handleCreateCustomColor(newColorName, newColorHex);
                                                        setShowColorCreator(false);
                                                        setNewColorName("");
                                                        setNewColorHex("#000000");
                                                    }}
                                                    className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                                                >
                                                    Save & Select
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Colors Display */}
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {(Array.isArray(selectedColors) ? selectedColors : []).map((color, index) => (
                                            <div
                                                key={`selected-color-${color.id || index}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                                            >
                                                <div 
                                                    className={clsx(
                                                        "w-4 h-4 rounded-full border border-gray-300",
                                                        color.color?.startsWith('bg-') && color.color
                                                    )}
                                                    style={{
                                                        backgroundColor: color.color?.startsWith('bg-') ? undefined : color.color
                                                    }}
                                                />
                                                <span className="font-medium text-gray-800">
                                                    {color.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveColor(color.id)}
                                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Attributes Selection */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Select Attributes:
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onChange={handleAttributeSelect}
                                            defaultValue=""
                                        >
                                            <option value="">Select attributes</option>
                                            {(availAttributes || []).map((attr) => (
                                                <option key={`avail-attr-${attr.id}`} value={attr.id}>
                                                    {attr.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Selected Attribute Display */}
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {(Array.isArray(attributes) ? attributes : []).map((attr, index) => (
                                            <div
                                                key={`attr-display-${attr.id || attr.name || index}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                                            >
                                                <div className="w-4 h-4 rounded-full bg-blue-200"></div>
                                                <span className="font-medium text-gray-800">
                                                    {attr.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttribute(attr.id)}
                                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Attribute input fields */}
                            {attributes.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                                    {attributes.map((attr) => (
                                        <div className="space-y-2" key={attr.id}>
                                            <label className="block text-sm font-medium text-gray-600">
                                                {attr.name}
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder={`Enter ${attr.name.toLowerCase()}`}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const value = (e.target as HTMLInputElement).value.trim();
                                                        if (!value) return;
                                                        addAttributeValue(attr.id, value);
                                                        (e.target as HTMLInputElement).value = "";
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const value = e.target.value.trim();
                                                    if (!value) return;
                                                    addAttributeValue(attr.id, value);
                                                    e.target.value = "";
                                                }}
                                            />

                                            {/* Display entered values */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {Array.isArray(attr.values) && attr.values.map((val: string, index: number) => (
                                                    <span
                                                        key={`${attr.id}-val-${index}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                                                    >
                                                        {val}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttributeValue(attr.id, val)}
                                                            className="text-blue-700 hover:text-blue-900"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* Variations Table */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        Generated Variations:
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {variations.length} variation(s)
                                    </span>
                                </div>

                                {variations.length > 0 ? (
                                    <>
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-4 mb-4 px-4">
                                            <div className="col-span-1">
                                                <span className="text-sm font-medium text-gray-600">SL</span>
                                            </div>
                                            <div className="col-span-4">
                                                <span className="text-sm font-medium text-gray-600">Variation Details</span>
                                            </div>
                                            <div className="col-span-3">
                                                <span className="text-sm font-medium text-gray-600">SKU</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-sm font-medium text-gray-600">Stock</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-sm font-medium text-gray-600">Price (৳)</span>
                                            </div>
                                        </div>

                                        {/* Variation Rows */}
                                        {(Array.isArray(variations) ? variations : []).map((variation, index) => (
                                            <div
                                                key={`variation-${variation.id || index}`}
                                                className="grid grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="col-span-1 flex items-center">
                                                    <span className="font-medium text-gray-700">
                                                        {index + 1}.
                                                    </span>
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className={clsx(
                                                                "w-6 h-6 rounded-full border border-gray-300",
                                                                variation.colorClass?.startsWith('bg-') && variation.colorClass
                                                            )}
                                                            style={{
                                                                backgroundColor: variation.colorClass?.startsWith('bg-') ? undefined : variation.colorClass
                                                            }}
                                                        />
                                                        <div>
                                                            <span className="font-medium text-gray-800 block">
                                                                {variation.color}
                                                            </span>
                                                            {variation.attributes && Object.keys(variation.attributes).length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {Object.entries(variation.attributes).map(([key, value]) => (
                                                                        <span
                                                                            key={key}
                                                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                                                        >
                                                                            {key}: {value as string}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        value={variation.sku}
                                                        onChange={(e) => handleVariationChange(variation.id, "sku", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        value={variation.stock}
                                                        onChange={(e) => handleVariationChange(variation.id, "stock", parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Price"
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        value={variation.price || ""}
                                                        onChange={(e) => handleVariationChange(variation.id, "price", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                                        <p>No variations generated yet.</p>
                                        <p className="text-sm mt-1">
                                            Select colors and attributes above to generate variations.
                                        </p>
                                    </div>
                                )}

                                {/* Add More Variations Button */}
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={handleAddVariation}
                                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50"
                                    >
                                        <Plus size={20} />
                                        Add Custom Variation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Image Upload */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Product Image
                        </h2>

                        <div className="space-y-6">
                            {/* Image Preview */}
                            {formData.image && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Preview
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4">
                                        <img
                                            src={resolveImageUrl(formData.image)}
                                            alt="preview"
                                            className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    Upload Image
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e.target.files!, 'image')}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                            <span className="text-gray-600 font-medium">
                                                Click to upload or drag and drop
                                            </span>
                                            <span className="text-gray-500 text-sm mt-1">
                                                SVG, PNG, JPG or GIF (max. 5MB)
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Image Gallery
                        </h2>

                        <div className="space-y-6">
                            {/* Uploaded Images Preview */}
                            {formData.gallery_images.length > 0 ? (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Gallery Images ({formData.gallery_images.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={clearAllGalleryImages}
                                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {(Array.isArray(formData.gallery_images) ? formData.gallery_images : []).map((image, index) => (
                                            <div key={`gallery-${index}`} className="relative group">
                                                <div className="aspect-square overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                                                    <img
                                                        src={resolveImageUrl(image)}
                                                        alt={`Gallery Image ${index + 1}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    title="Remove image"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 text-center truncate">
                                                    Image {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No gallery images uploaded yet</p>
                                </div>
                            )}

                            {/* File Upload Section */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-600">
                                    Upload Multiple Images
                                </label>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                                handleImageUpload(files, 'gallery');
                                            }
                                            e.target.value = "";
                                        }}
                                        className="hidden"
                                        id="gallery-upload"
                                        disabled={galleryUploading}
                                    />
                                    <label
                                        htmlFor="gallery-upload"
                                        className={`cursor-pointer ${galleryUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            {galleryUploading ? (
                                                <>
                                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                                                    <span className="text-gray-600 font-medium">
                                                        Uploading Images...
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                                    <span className="text-gray-600 font-medium">
                                                        Click to upload or drag and drop
                                                    </span>
                                                    <span className="text-gray-500 text-sm mt-1">
                                                        PNG, JPG, GIF, SVG, WEBP (max. 5MB each)
                                                    </span>
                                                    <span className="text-blue-500 text-sm mt-2 font-medium">
                                                        Select multiple files
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Color-wise Image Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Color wise Image Upload
                        </h2>

                        <div className="space-y-6">
                            {selectedColors.map((color) => (
                                <div key={color.id} className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-600">
                                        {color.name} Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files!, 'color', color.id)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {color.image && (
                                            <img
                                                src={resolveImageUrl(color.image)}
                                                alt={`${color.name} preview`}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {selectedColors.length === 0 && (
                                <div className="text-center py-6 text-gray-500 italic">
                                    No colors selected yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Tags Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            Search Tags
                        </h2>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(Array.isArray(tags) ? tags : []).map((tag, index) => (
                                    <span
                                        key={`tag-${index}`}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-blue-700 hover:text-blue-900 text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {tags.length === 0 && (
                                    <span className="text-gray-500 text-sm">
                                        No tags added yet
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SEO Metadata */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6">
                            SEO Metadata (Optional)
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                                <input
                                    name="meta_title"
                                    value={formData.meta_title}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="SEO Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                                <textarea
                                    name="meta_description"
                                    value={formData.meta_description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="SEO Description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Keywords</label>
                                <input
                                    name="meta_keywords"
                                    value={formData.meta_keywords}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="keywords, comma, separated"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;